<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense"> </ion-header>

      <div id="map" style="width: 100%; height: 100%"></div>
      <button
        @click="recenterMapHandler && recenterMapHandler()"
        class="recenter-button"
      >
        <ion-icon aria-hidden="true" :icon="locateOutline" class="icon-green" />
      </button>
      <div v-show="showCameraOverlay" class="camera-overlay">
        <video ref="videoRef" autoplay muted playsinline></video>
        <canvas ref="canvasRef" v-show="false"></canvas>
        <ion-text color="light">
          <h1>{{ infoText }}</h1>
        </ion-text>
        <ion-button @click="toggleCameraOverlay" class="close-button">
        </ion-button>
      </div>

      <div v-if="showBarcodeOverlay" class="barcode-overlay">
        <div id="interactive" class="viewport"></div>
        <div id="scanner-container"></div>

        <div class="scan-instruction">
          <ion-icon aria-hidden="true" :icon="scanOutline" class="scan-icon" />
          <div class="scan-text">Scan barcode of your bottle</div>
        </div>

        <ion-button
          style="
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
          "
          @click="toggleBarcodeOverlay"
          >Close Scanner</ion-button
        >
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref, onMounted, nextTick, onUnmounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  alertController,
} from "@ionic/vue";
import { locateOutline, scanOutline } from "ionicons/icons";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { app, db } from "@/firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  updateDoc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  getFirestore,
} from "firebase/firestore";
import { Geolocation } from "@capacitor/geolocation";

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
const router = useRouter();
let userLocationMarker; // Variable to store the user location marker
let watcherId; // Variable to store the watcher ID
const recenterMapHandler = ref(null);
const auth = getAuth(app);

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
    style: "mapbox://styles/mapbox/streets-v12",
    center: centerCoordinates,
    zoom: 10,
  });
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is signed in:", user);
      // Initialize your map or do any other operations here.
    } else {
      console.log("No user");
    }
  });

  // Function to re-center the map to the user's current location
  function recenterMap() {
    Geolocation.getCurrentPosition({
      maximumAge: 300000,
      timeout: 5000,
      enableHighAccuracy: true,
    })
      .then((resp) => {
        map.flyTo({
          center: [resp.coords.longitude, resp.coords.latitude],
          essential: true,
        });
      })
      .catch((error) => {
        console.error("Error getting location", error);
      });
  }

  recenterMapHandler.value = recenterMap;

  map.on("load", () => {
    Geolocation.getCurrentPosition({
      maximumAge: 300000,
      timeout: 5000,
      enableHighAccuracy: true,
    }).then((resp) => {
      map.flyTo({
        center: [resp.coords.longitude, resp.coords.latitude],
        essential: true,
      });

      // Create a new HTML element for the user's location marker
      const userLocationEl = document.createElement("div");
      userLocationEl.className = "user-location-marker";

      // Add a marker for the user's current location
      userLocationMarker = new mapboxgl.Marker(userLocationEl)
        .setLngLat([resp.coords.longitude, resp.coords.latitude])
        .addTo(map);

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
                `<div style="color: white;">
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <h3>ID: ${marker.stationNumber}</h3>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <i class="icon ion-md-locate" style="color: white; font-size: 20px; margin-right: 10px;"></i>
          <h6>Location: ${marker.placeName}</h6>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <i class="icon ion-md-home" style="color: white; font-size: 20px; margin-right: 10px;"></i>
          <h6>Address:${marker.address}</h6>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 5px;">
          <i class="icon ion-md-water" style="color: white; font-size: 20px; margin-right: 10px;"></i>
          <h6>Full: ${marker.currentCap}</h6>
      </div>
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
    watcherId = Geolocation.watchPosition(
      { maximumAge: 300000, timeout: 5000, enableHighAccuracy: true },
      (position, err) => {
        if (!err && position) {
          // Update the user-location-marker's position
          userLocationMarker.setLngLat([
            position.coords.longitude,
            position.coords.latitude,
          ]);
        }
      }
    ).catch((error) => {
      console.error("Error getting location", error);
    });
  });
}

async function recycleBottle(stationNumber) {
  // Get the currently logged-in user
  const user = auth.currentUser;
  console.log(user);

  if (!user) {
    // Redirect to login if the user is not logged in
    router.push("login"); // Adjust with your router setup
    return;
  }
  if (!stationNumber) {
    console.error("No stationNumber provided.");
    return;
  }

  const marker = markers.value.find((m) => m.stationNumber === stationNumber);
  if (!marker) {
    console.error("Marker not found");
    return;
  }

  if (marker.currentCap >= marker.capacity) {
    presentAlert();
    console.log("marker capacity is " + marker.capacity);
    return;
  }

  async function presentAlert() {
    const alert = await alertController.create({
      header: "Station Full",
      message:
        "This station is full, please use another Cycl recycling station.",
      buttons: ["OK"],
    });

    return alert.present();
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
            target: document.querySelector("#interactive"), // targeting the interactive div
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
            let canRecycle = false; // Initialize outside of your data check loop

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

                        // Check if recycledPrediction_on is true
                        if (
                          recycledPrediction_on &&
                          recycledPrediction_on.probability > 0.8
                        ) {
                          infoText.value = "Drop your bottle";
                          canRecycle = true; // Set the flag to true when recycledPrediction_on is met
                        }
                        // If recycledPrediction_on condition was previously met, then check for recycledPrediction
                        else if (
                          canRecycle &&
                          recycledPrediction &&
                          recycledPrediction.probability > 0.8
                        ) {
                          clearInterval(intervalId);
                          showCameraOverlay.value = false;
                          console.log("Bottle is recycled");
                          alert("bottle recycled");
                          infoText.value = "Bottle recycled";
                          isCurrentCapUpdated = true;
                          // Update marker capacity
                          marker.currentCap += 1;
                          canRecycle = false; // Reset the flag

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

                          // Get the currently logged-in user
                          const auth = getAuth(app);
                          // Get the currently logged-in user
                          const user = auth.currentUser;

                          // User is logged in, proceed to update the Cycl-coins
                          try {
                            const userDocRef = doc(db, "users", user.uid); // Adjust "users" to your users collection name
                            const userDoc = await getDoc(userDocRef);

                            if (userDoc.exists()) {
                              // If the user document exists, get the current Cycl-coins value
                              const userData = userDoc.data();
                              let cyclCoins = userData?.CyclCoins || 0;

                              // Increment the Cycl-coins by a certain amount
                              cyclCoins += 2;

                              // Update the user's Cycl-coins in the database
                              await updateDoc(userDocRef, {
                                CyclCoins: cyclCoins,
                              });
                            } else {
                              // If the user document does not exist, create it with Cycl-coins set to a certain amount
                              await setDoc(userDocRef, { CyclCoins: 2 });
                            }
                          } catch (error) {
                            console.error("Error updating Cycl-coins:", error);
                          }
                        } else if (
                          recycledPrediction_on &&
                          recycledPrediction_on.probability > 0.8
                        ) {
                          infoText.value = "Drop your bottle";
                        } else {
                          infoText.value =
                            "Place your bottle on top of the hole";
                        }
                      }
                    } catch (error) {
                      console.error(error);
                    }
                  },
                  "image/jpeg",
                  0.5
                );
              }, 1500);
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
onUnmounted(() => {
  // Clear the geolocation watcher when the component is unmounted
  if (watcherId != null) {
    Geolocation.clearWatch({ id: watcherId });
  }
});
onMounted(() => {
  loadMarkers().then(() => {
    initMap();
  });
});
</script>

<style>
.camera-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    var(--ion-color-primary-tint) 0%,
    var(--ion-color-primary-shade) 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.camera-overlay h1 {
  color: var(--ion-color-light);
  font-size: 2em;
  margin-bottom: 20px;
  z-index: 1000;
  text-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  font-family: "Roboto", sans-serif;
}

.camera-overlay button {
  --background: var(--ion-color-primary);
  --color: var(--ion-color-light);
  --padding-start: 1em;
  --padding-end: 1em;
  --border-radius: 12px;
  font-size: 1em;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.camera-overlay .close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  --background: var(--ion-color-danger);
  --color: var(--ion-color-light);
  font-size: 24px;
  padding: 10px;
  cursor: pointer;
  z-index: 1000;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  z-index: 10;
  backdrop-filter: blur(10px);
}

.viewport,
#interactive {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 100;
  border-radius: 15px;
}

button {
  margin-top: 20px;
  --padding-start: 10px;
  --padding-end: 10px;
  --font-size: 16px;
  z-index: 1000;
  --border-radius: 12px;
  --background: var(--ion-color-primary);
  --color: var(--ion-color-light);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.custom-marker {
  background-image: url("/196.png");
  background-size: cover;
  width: 50px;
  height: 50px;
  border-radius: 50%; /* Optional: for rounded markers */
  cursor: pointer;
}
.mapboxgl-popup-content {
  background-color: #31b46f !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  padding: 15px !important;
  display: flex;
  flex-direction: column;
  align-items: start;
  z-index: 7;
}

.mapboxgl-popup-content i {
  margin-right: 8px;
  z-index: 7;
}

.mapboxgl-popup-content h3,
.mapboxgl-popup-content h6 {
  display: flex;
  align-items: center;
  margin-top: 10px;
  color: #ffffff !important;
  z-index: 7;
}

.mapboxgl-popup-content button {
  background-color: #65bc50;
  border: none;
  color: white;
  padding: 10px 25px;
  text-align: center;
  display: inline-block;
  font-size: 16px;
  margin: 10px 0;
  cursor: pointer;
  border-radius: 8px;
  z-index: 7;
}

.user-location-marker {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #1d72b8;
  border: 2px solid #fff;
  box-shadow: 0 0 5px #1d72b8;
  position: relative;
  z-index: 3;
}

.user-location-marker::after {
  content: "";
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(29, 114, 184, 0.3);
  position: absolute;
  top: -50%;
  left: -50%;
  transform: translate(-50%, -50%);
  animation: pulse 3s infinite;
  z-index: 1000;
}

@keyframes pulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.recenter-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #ffffff;
  border-radius: 50%;
  padding: 10px;
  border: none;
  z-index: 0;
}

.icon-green {
  color: #65bc50;
}

.scan-instruction {
  position: absolute;
  top: 10px; /* Adjust as necessary */
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: #fff; /* Adjust color as necessary */
  z-index: 100;
}

.scan-icon {
  font-size: 50px; /* Adjust size as necessary */
  color: #fff; /* Adjust color as necessary */
  z-index: 100;
  width: 250px;
  height: 250px;
}

.scan-text {
  font-size: 16px; /* Adjust size as necessary */
  margin-top: 10px; /* Adjust margin as necessary */
}
</style>
