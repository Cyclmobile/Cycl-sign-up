<template>
  <ion-page>
    <ion-header> </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense"> </ion-header>

      <div id="map" style="width: 100%; height: 100%"></div>
      <div v-show="showCameraOverlay" class="camera-overlay">
        <video ref="videoRef" autoplay muted playsinline></video>
        <canvas ref="canvasRef"></canvas>
        <p>{{ infoText }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/vue";
import mapboxgl from "mapbox-gl";
import { updateDoc, doc } from "firebase/firestore";
import "mapbox-gl/dist/mapbox-gl.css";
import { db } from "@/firebase.js"; // Adjust the path to point to your firebase.js file
import { collection, getDocs, query } from "firebase/firestore";

interface Marker {
  stationNumber: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
  placeName: string;
  address: string;
  capacity: number;
  currentCap: number;
}

const markers = ref<Marker[]>([]);
const areMarkersLoaded = ref(false);
const showCameraOverlay = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);
const infoText = ref("ppp");
let currentMarker = ref(null);

async function loadMarkers() {
  try {
    const q = query(collection(db, "stations"));
    const querySnapshot = await getDocs(q);
    markers.value = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        stationNumber: doc.id,
        ...data,
        latitude: data.coordinates?.[0] ?? 0,
        longitude: data.coordinates?.[1] ?? 0,
        placeName: data.placeName ?? "",
        address: data.address ?? "",
        currentCap: data.currentCap ?? 0, // Provide a default value
      };
    });
  } catch (error) {
    console.error("Error fetching markers:", error);
  }
}
window.recycleBottle = recycleBottle;

function initMap(centerCoordinates: [number, number] = [0, 0]) {
  console.log("initMap is executed with coordinates", centerCoordinates);

  mapboxgl.accessToken =
    "pk.eyJ1IjoiY3ljbG1vYmlsZWFwcCIsImEiOiJja3lxODRlOHQwMGR0MnhzMHd3YXl3OTVxIn0.Gg2Zqy13hJU5iDUuV_F2Zg";

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: centerCoordinates,
    zoom: 10,
  });

  // Add geolocation controls to the map.
  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    trackUserLocation: true,
    showUserLocation: true,
    fitBoundsOptions: {
      maxZoom: 15,
    },
  });

  map.addControl(geolocate);

  map.on("load", () => {
    // Automatically trigger the geolocation control to get the user's location
    geolocate.trigger();

    // Add markers to the map
    markers.value.forEach((marker) => {
      new mapboxgl.Marker()
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML(
              `<div style="color: black;">
                <h3>${marker.placeName}</h3>
                <p>${marker.address}</p>
                <p>Current Capacity: ${marker.currentCap}</p>
                <p>Station Number: ${marker.stationNumber}</p>
<button onClick="window.recycleBottle('${marker.stationNumber}')">Recycle your bottle</button>
              </div>`
            )
        )
        .addTo(map)
        .on("click", () => {
          currentMarker = marker; // set the current marker when a marker is clicked
        });
    });
  });
}

async function recycleBottle(stationNumber) {
  const marker = markers.value.find((m) => m.stationNumber === stationNumber);
  if (!marker) {
    console.error("Marker not found");
    return;
  }

  showCameraOverlay.value = true;

  const video = videoRef.value;
  const canvas = canvasRef.value;
  const context = canvas.getContext("2d");

  const predictionKey = "75deb4a7d3c64b8e9f9cb69984efbc6f";
  const predictionURL =
    "https://northeurope.api.cognitive.microsoft.com/customvision/v3.0/Prediction/c066cfd2-2ebc-4a0b-9250-fb6470db2a19/detect/iterations/Iteration18/image";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    });
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
    };
  } catch (error) {
    console.error("Error accessing camera:", error);
    alert("Camera error: " + error.message);
    return;
  }

  video.addEventListener("play", () => {
    const draw = () => {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(draw);
    };
    draw();

    let isCurrentCapUpdated = false;

    const intervalId = setInterval(async () => {
      canvas.toBlob(
        async (blob) => {
          try {
            const response = await fetch(predictionURL, {
              method: "POST",
              headers: {
                "Prediction-Key": predictionKey,
                "Content-Type": "application/octet-stream",
              },
              body: blob,
            });
            const data = await response.json();
            console.log(data);

            if (data.predictions && data.predictions.length > 0) {
              const recycledPrediction = data.predictions.find(
                (p) => p.tagName === "recycled"
              );
              const recycledPrediction_off = data.predictions.find(
                (p) => p.tagName === "OffPosition"
              );
              const recycledPrediction_on = data.predictions.find(
                (p) => p.tagName === "on-position"
              );

              if (recycledPrediction && recycledPrediction.probability > 0.8) {
                clearInterval(intervalId);
                showCameraOverlay.value = true;
                console.log("Bottle is recycled");
                isCurrentCapUpdated = true;

                // Update marker capacity
                marker.currentCap += 1;

                // Update the currentCap in the Firestore database
                try {
                  const markerRef = doc(db, "stations", stationNumber);
                  await updateDoc(markerRef, {
                    currentCap: marker.currentCap,
                  });
                } catch (error) {
                  console.error(
                    "Error updating capacity in the database",
                    error
                  );
                  alert("Failed to update capacity in the database");
                }
              } else if (
                recycledPrediction_on &&
                recycledPrediction_on.probability > 0.8
              ) {
                infoText.value = "Drop your bottle";
                alert("You can now let it go");
              } else {
                infoText.value = "Place your bottle top of the hole";
              }
            }
          } catch (error) {
            console.error(error);
          }
        },
        "image/jpeg",
        0.8
      );
    }, 150);
  });
}

onMounted(() => {
  loadMarkers().then(() => {
    initMap();
  });
});
</script>

<style>
.overlay {
  position: fixed;
  bottom: 0;
  background-color: white; /* Light background for the card */
  width: 90%; /* Reduced width with some spacing on the sides */
  padding: 20px;
  border-radius: 15px; /* Rounded corners for a softer appearance */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); /* Box shadow for a "lifting" effect */
  z-index: 1000;
  margin: 20px; /* Margin to ensure the card does not stick to the edges of the viewport */
  color: #333; /* Dark text color for contrast against the light background */
}

.overlay div {
  margin-bottom: 10px;
}

.overlay button {
  background-color: #65bc50; /* Using one of your palette colors for the close button */
  border: none;
  padding: 10px;
  border-radius: 50%;
  color: white;
  font-size: 18px;
}

.my-popup {
  max-width: 300px; /* Restricting the width to make the popup card-like */
  background-color: white; /* Light background color */
  border-radius: 15px; /* Rounded corners */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); /* Box shadow for a "lifting" effect */
  padding: 20px; /* Padding for a structured appearance */
  color: #333; /* Dark text color */
}

.my-popup h3 {
  color: #31b46f; /* Using your palette color for the title */
  margin-bottom: 10px;
}

.my-popup p {
  margin-bottom: 10px;
}

.my-popup button {
  background-color: #65bc50; /* Using your palette color for the button */
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

.my-popup button:hover {
  background-color: #539a48; /* A slightly darker shade for the hover effect */
}

.marker {
  background-image: url("/196.png");
  background-size: cover;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 100;
  border: 2px solid #65bc50; /* Using your palette color for the marker border */
}

.camera-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.cross-out-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #ff0000;
  border: none;
  border-radius: 50%;
  padding: 10px;
  font-size: 20px;
  color: #ffffff;
  cursor: pointer;
}

#map {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 100;
}

.camera-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

video,
canvas {
  max-width: 100%;
  border: 1px solid black;
}
</style>
