<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 3</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 3</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item v-for="item in userHistory" :key="item.id">
          <ion-thumbnail slot="start">
            <img :src="item.image" alt="image" />
          </ion-thumbnail>
          <ion-note slot="end">{{
            formatTimestamp(item.timestamp.toDate())
          }}</ion-note>
          <div slot="end">
            <p>cost</p>
            {{ item.amount }}
          </div>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
  IonNote,
} from "@ionic/vue";
import { ref, onMounted } from "vue";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  collection,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB3KjQPSVjw0PTwn1AkKdPLlW6yyom3_GE",
  authDomain: "wifiyer.firebaseapp.com",
  projectId: "wifiyer",
  storageBucket: "wifiyer.appspot.com",
  messagingSenderId: "409869290584",
  appId: "1:409869290584:web:36bf46c2e3ecb098610e2d",
  measurementId: "G-7GLD6P4N2G",
};

initializeApp(firebaseConfig); // This should come before using any Firebase services

const db = getFirestore();
const auth = getAuth();

const userHistory = ref([]);

function formatTimestamp(date) {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userHistRef = collection(db, `users/${user.uid}/history`);
      const userHistSnap = await getDocs(userHistRef);

      userHistory.value = userHistSnap.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
    }
  });
});
</script>
