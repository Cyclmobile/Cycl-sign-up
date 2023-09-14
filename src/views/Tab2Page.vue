<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 2</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 2</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="map" style="width: 100%; height: 100%"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from "@ionic/vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import ExploreContainer from "@/components/ExploreContainer.vue";

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
  });
}

onMounted(() => {
  initMap();
});
</script>
