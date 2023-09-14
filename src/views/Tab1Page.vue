<template>
  <ion-page>
    <ion-header></ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense"></ion-header>

      <div v-if="showCameraOverlay" class="camera-overlay">
        <button class="cross-out-btn" @click="hideCameraOverlay">X</button>

        <video
          ref="video"
          width="640"
          height="480"
          autoplay
          muted
          playsinline
          style="display: none"
        ></video>
        <canvas ref="canvas" width="640" height="480"></canvas>
        <p id="steps">{{ currentStep }}</p>
      </div>

      <div id="map" style="width: 100%; height: 100%"></div>
      <div v-if="showOverlay" class="overlay">
        <p @click="closeOverlay">X</p>
        <div>Station Number: {{ selectedMarker?.stationNumber }}</div>
        <div>Place: {{ selectedMarker?.placeName }}</div>
        <div>Address: {{ selectedMarker?.address }}</div>
        <div>Capacity: {{ selectedMarker?.capacity }}</div>
        <div>Current Capacity: {{ selectedMarker?.currentCap }}</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/vue";
import mapboxgl from "mapbox-gl";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
} from "firebase/firestore/lite";

interface Marker {
  stationNumber: string;
  placeName: string;
  address: string;
  capacity: number;
  currentCap: number;
  latitude: number;
  longitude: number;
}

const firebaseConfig = {
  apiKey: "AIzaSyB3KjQPSVjw0PTwn1AkKdPLlW6yyom3_GE",
  authDomain: "wifiyer.firebaseapp.com",
  projectId: "wifiyer",
  storageBucket: "wifiyer.appspot.com",
  messagingSenderId: "409869290584",
  appId: "1:409869290584:web:36bf46c2e3ecb098610e2d",
  measurementId: "G-7GLD6P4N2G",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let markers = ref<Marker[]>([]);
let showOverlay = ref(false);
let selectedMarker = ref<Marker | null>(null);

let video = ref<HTMLVideoElement | null>(null);
let canvas = ref<HTMLCanvasElement | null>(null);
let info = ref<HTMLElement | null>(null);

let showCameraOverlay = ref(false);

// Expose the showCameraOverlay ref to the template
defineExpose({ showCameraOverlay });

let intervalId: NodeJS.Timeout | null = null;

const predictionKey = "75deb4a7d3c64b8e9f9cb69984efbc6f";
const predictionURL =
  "https://northeurope.api.cognitive.microsoft.com/customvision/v3.0/Prediction/c066cfd2-2ebc-4a0b-9250-fb6470db2a19/detect/iterations/Iteration28/image";

onMounted(async () => {
  await loadMarkers();
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLocation = [
        position.coords.longitude,
        position.coords.latitude,
      ];
      initMap(userLocation);
    },
    () => {
      console.warn(
        "Could not retrieve user location. Defaulting to coordinates [0, 0]."
      );
      initMap([0, 0]);
    }
  );
});

function initMap(centerCoordinates: [number, number]) {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiY3ljbG1vYmlsZWFwcCIsImEiOiJja3lxODBqYmwwYW10Mnd0Z2dxdDZxZGF2In0.ElRjKCz4QVFOQ8l_0hJjSw";

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
    addMarkersToMap(map);

    // Automatically trigger the geolocation control to get the user's location
    geolocate.trigger();
  });
}

function addMarkersToMap(map: mapboxgl.Map) {
  markers.value.forEach((marker) => {
    const el = document.createElement("div");
    el.className = "marker";
    const popup = new mapboxgl.Popup({ offset: 25, className: "my-popup" })
      .setHTML(
        `<div style="color: black;"><h3>ID: ${marker.stationNumber}</h3><h5>Address: ${marker.address}</h5><h5>Place Name: ${marker.placeName}</h5><h5>Capacity: ${marker.currentCap} %</h5></div><button id="recycle-button">Recycle</button>`
      )
      .on("open", () => {
        selectedMarker.value = marker; // Set the selectedMarker here
        document
          .getElementById("recycle-button")
          ?.addEventListener("click", onRecycleClick);
      });

    new mapboxgl.Marker(el)
      .setLngLat([marker.longitude, marker.latitude])
      .addTo(map)
      .setPopup(popup)
      .on("click", () => {
        selectedMarker.value = marker;
        showOverlay.value = true;
      });
  });
}

async function loadMarkers() {
  try {
    const q = query(collection(db, "stations"));
    const querySnapshot = await getDocs(q);
    markers.value = querySnapshot.docs.map(
      (doc) =>
        ({
          stationNumber: doc.id,
          ...doc.data(),
          latitude: doc.data().coordinates[0],
          longitude: doc.data().coordinates[1],
        } as Marker)
    );

    if (selectedMarker.value) {
      const updatedSelectedMarker = markers.value.find(
        (marker) => marker.stationNumber === selectedMarker.value.stationNumber
      );
      if (updatedSelectedMarker) {
        selectedMarker.value = { ...updatedSelectedMarker };
      }
    }
  } catch (error) {
    console.error("Error fetching markers: ", error);
  }
}

function hideCameraOverlay() {
  showCameraOverlay.value = false;
  // Here you can also clear any intervals and stop the video stream if necessary
  if (intervalId) {
    clearInterval(intervalId);
  }
  if (video.value && video.value.srcObject) {
    const tracks = video.value.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
  }
}

function closeOverlay() {
  showOverlay.value = false;
}

function onRecycleClick() {
  console.log("Recycle button clicked with marker", selectedMarker.value);
  showCameraOverlay.value = true;
  nextTick(() => {
    initCameraAndPrediction();
  });
}

function initCameraAndPrediction() {
  if (!video.value || !canvas.value) {
    console.error("Video or canvas element is not available");
    return;
  }
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      .then((stream) => {
        video.value.srcObject = stream;
        video.value.onloadedmetadata = () => {
          video.value.play();
        };
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  }

  video.value.addEventListener("play", async () => {
    const draw = () => {
      canvas.value
        .getContext("2d")
        .drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
      requestAnimationFrame(draw);
    };
    draw();

    intervalId = setInterval(async () => {
      canvas.value.toBlob(
        async (blob) => {
          fetch(predictionURL, {
            method: "POST",
            headers: {
              "Prediction-Key": predictionKey,
              "Content-Type": "application/octet-stream",
            },
            body: blob,
          })
            .then((response) => response.json())
            .then(async (data) => {
              let recycledPrediction = data.predictions.find(
                (p) => p.tagName === "recycled"
              );
              let recycledPrediction_off = data.predictions.find(
                (p) => p.tagName === "OffPosition"
              );
              let recycledPrediction_on = data.predictions.find(
                (p) => p.tagName === "on-position"
              );

              if (recycledPrediction && recycledPrediction.probability > 0.8) {
                alert("bottle is recycled");
                document.getElementById("steps").innerHTML = "Recycled";

                console.log(
                  "Selected marker before increment",
                  selectedMarker.value
                );

                // Increase the currentCap by 1
                selectedMarker.value.currentCap += 1;
                console.log(
                  "CurrentCap after increment: ",
                  selectedMarker.value.currentCap,
                  alert("increased")
                );

                // Check if the currentCap equals the capacity of the selectedMarker
                if (
                  selectedMarker.value.currentCap >=
                  selectedMarker.value.capacity
                ) {
                  alert("This station is full");
                }

                // Update the currentCap in Firestore
                try {
                  const markerDoc = doc(
                    db,
                    "stations",
                    selectedMarker.value.stationNumber
                  );
                  await updateDoc(markerDoc, {
                    currentCap: selectedMarker.value.currentCap,
                  });
                  console.log(
                    "CurrentCap after attempted update: ",
                    selectedMarker.value.currentCap
                  );
                  // Fetch the fresh data from Firestore after update
                  await loadMarkers();
                } catch (e) {
                  console.error("Error updating document: ", e);
                  alert("Error updating document: " + e.message);
                }
              } else if (
                recycledPrediction_on &&
                recycledPrediction_on.probability > 0.8
              ) {
                document.getElementById("steps").innerHTML =
                  "You can now let it go";
              } else {
                document.getElementById("steps").innerHTML =
                  "Place your bottle top of the hole";
              }

              // console.log(data);
              // Handle the data returned from the API (update info.value with relevant data)
            })
            .catch((error) => console.error(error));
        },
        "image/jpeg",
        0.8
      );
    }, 150);
  });
}

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
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
</style>
