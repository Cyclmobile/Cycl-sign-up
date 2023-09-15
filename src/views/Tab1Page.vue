<template>
  <ion-page>
    <ion-header> </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense"> </ion-header>

      <div id="map" style="width: 100%; height: 100%"></div>
      <div v-show="showCameraOverlay" class="camera-overlay">
        <video ref="videoRef" autoplay muted playsinline></video>
        <canvas ref="canvasRef" v-show="false"></canvas>
        <p>{{ infoText }}</p>
      </div>
      <div v-if="showBarcodeOverlay" class="barcode-overlay">
        <div id="interactive" class="viewport"></div>
        <div id="scanner-container"></div>
        <button @click="toggleBarcodeOverlay">Close Scanner</button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/vue";
import mapboxgl from "mapbox-gl";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import "mapbox-gl/dist/mapbox-gl.css";
import { db } from "@/firebase.js"; // Adjust the path to point to your firebase.js file
import { collection, getDocs, query } from "firebase/firestore";
import Quagga from "quagga";

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
const infoText = ref("");
let currentMarker = ref(null);
const showBarcodeOverlay = ref(false);

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
    style: "mapbox://styles/mapbox/outdoors-v12",
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
      // Create a new HTML element for each marker and apply the custom class
      var el = document.createElement("div");
      el.className = "custom-marker";

      new mapboxgl.Marker(el)
        .setLngLat([marker.longitude, marker.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML(
              `<div style="color: black;">
                 <h3>ID: ${marker.stationNumber}</h3>
              <h6>Location: ${marker.placeName}</h6>
              <h6>address:${marker.address}</h6>
              <h6>Full: ${marker.currentCap}</h6>
<button onClick="window.recycleBottle('${marker.stationNumber}')">Recycle your bottle</button>
            </div>`
            )
        )
        .addTo(map)
        .on("click", () => {
          currentMarker = marker; // set the current marker when a marker is clicked
          console.log("Current marker set:", currentMarker.value);
        });
    });
  });
}

async function recycleBottle(stationNumber) {
  if (!stationNumber) {
    console.error("No stationNumber provided.");
    return;
  }

  const marker = markers.value.find((m) => m.stationNumber === stationNumber);
  if (!marker) {
    console.error("Marker not found");
    return;
  }

  showBarcodeOverlay.value = true;

  nextTick(async () => {
    try {
      await Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            constraints: {
              width: 640,
              height: 480,
              facingMode: "environment",
            },
            target: document.querySelector("#scanner-container"),
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
          },
          numOfWorkers: 4,
          decoder: {
            readers: ["code_128_reader"],
          },
          locate: true,
        },
        function (err) {
          if (err) {
            console.log(err);
            return;
          }
          console.log("Initialization finished. Ready to start");
          Quagga.start();
        }
      );

      Quagga.onDetected(async (data) => {
        try {
          const scannedCode = data.codeResult.code;

          // Fetch valid codes from Firestore
          const denmarkDocRef = doc(
            db,
            "Barcodes",
            "Denmark",
            "coca-cola",
            "barcodes"
          );
          const norwayDocRef = doc(
            db,
            "Barcodes",
            "Norway",
            "coca-cola",
            "barcodes"
          );

          const [denmarkDoc, norwayDoc] = await Promise.all([
            getDoc(denmarkDocRef),
            getDoc(norwayDocRef),
          ]);

          const denmarkCodes = denmarkDoc.data()?.codes || [];
          const norwayCodes = norwayDoc.data()?.codes || [];

          // Check if the scanned code is in the list of valid codes
          if (
            denmarkCodes.includes(scannedCode) ||
            norwayCodes.includes(scannedCode)
          ) {
            console.log("Valid code");

            // Proceed with your existing logic for a valid code
            showBarcodeOverlay.value = false;
            Quagga.stop();
            showCameraOverlay.value = true;

            const video = videoRef.value;
            const canvas = canvasRef.value;
            const context = canvas.getContext("2d");

            const predictionKey = "75deb4a7d3c64b8e9f9cb69984efbc6f";
            const predictionURL =
              "https://northeurope.api.cognitive.microsoft.com/customvision/v3.0/Prediction/c066cfd2-2ebc-4a0b-9250-fb6470db2a19/detect/iterations/Iteration28/image";

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

                        if (
                          recycledPrediction &&
                          recycledPrediction.probability > 0.8
                        ) {
                          clearInterval(intervalId);
                          showCameraOverlay.value = true;
                          console.log("Bottle is recycled");
                          infoText.value = "Bottle recycled";
                          isCurrentCapUpdated = true;

                          // Update marker capacity
                          marker.currentCap += 1;

                          // Update the currentCap in the Firestore database
                          try {
                            const markerRef = doc(
                              db,
                              "stations",
                              stationNumber
                            );
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
          } else {
            console.log("Invalid code");
            // Handle the invalid code case
            // Perhaps you can show a message to the user indicating the code is invalid
          }
        } catch (error) {
          console.error("Error verifying the barcode:", error);
        }
      });
    } catch (error) {
      console.error("Quagga initialization error:", error);
    }
  });
}

onMounted(() => {
  loadMarkers().then(() => {
    initMap();
  });
});
</script>

<style>
.custom-marker {
  background-image: url("/196.png");
  background-size: cover;
  width: 50px;
  height: 50px;
  border-radius: 50%; /* Optional: for rounded markers */
  cursor: pointer;
}

.camera-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(49, 180, 111, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.camera-overlay h1 {
  color: #65bc50;
  font-size: 2em;
  margin-bottom: 20px;
  z-index: 1000;
}

.camera-overlay button {
  background-color: #65bc50;
  border: none;
  color: white;
  padding: 15px 30px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 12px;
  z-index: 1000;
}

.camera-overlay .close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #31b46f;
  border: none;
  color: white;
  padding: 10px;
  font-size: 20px;
  cursor: pointer;
  z-index: 1000;
}

.mapboxgl-popup-content {
  background-color: #31b46f !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  padding: 15px !important;
}

.mapboxgl-popup-content h3 {
  margin-top: 0;
  color: #ffffff !important;
}

.mapboxgl-popup-content h6 {
  margin-top: 0;
  color: #ffffff !important;
}

.mapboxgl-popup-content p {
  color: #ffffff !important;
}

.mapboxgl-popup-content button {
  background-color: #65bc50;
  border: none;
  color: white;
  padding: 15px 30px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 12px;
}
.barcode-overlay {
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
  z-index: 1000;
}

.viewport {
  width: 640px;
  height: 480px;
  position: relative;
}

button {
  margin-top: 20px;
  padding: 10px;
  font-size: 16px;
}

#scanner-container {
  width: 640px;
  height: 480px;
  z-index: 100;
}
</style>
