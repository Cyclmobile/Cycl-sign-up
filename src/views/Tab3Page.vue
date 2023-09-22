<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Rewards</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Rewards</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-list>
        <ion-item
          v-for="item in userHistory"
          :key="item.id"
          @click="setOpen(true, item)"
        >
          <ion-thumbnail slot="start">
            <img :src="item.image" alt="image" />
          </ion-thumbnail>

          <ion-grid>
            <ion-row>
              <!-- Column for Title -->
              <ion-col size="8">
                {{ item.title }}
              </ion-col>

              <!-- Column for Amount (Cost) -->
              <ion-col size="4" class="ion-text-right">
                {{ item.amount }}
              </ion-col>
            </ion-row>

            <!-- Row for Timestamp -->
            <ion-row>
              <ion-col size="12">
                <ion-note>{{
                  formatTimestamp(item.timestamp.toDate())
                }}</ion-note>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-item>
      </ion-list>

      <ion-modal :is-open="isOpen">
        <ion-header>
          <ion-toolbar
            style="background: linear-gradient(to right, #e3e3e3, #f7f7f7)"
          >
            <ion-title>Receipt</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="setOpen(false)">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content
          class="ion-padding"
          style="background: linear-gradient(to right, #e3e3e3, #f7f7f7)"
        >
          <ion-grid>
            <!-- Row for Amount with Big Text -->
            <ion-row>
              <ion-col size="12" class="ion-text-center">
                <h2 style="font-weight: bold; color: #333">
                  {{ selectedItem.amount }} CC
                </h2>
              </ion-col>
            </ion-row>
            <!-- Row for Image -->
            <ion-row>
              <ion-col size="12" class="ion-text-center">
                <ion-thumbnail
                  style="box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1)"
                >
                  <img :src="selectedItem.image" alt="image" />
                </ion-thumbnail>
              </ion-col>
            </ion-row>
            <!-- Row for Code & Exp (if exists) -->
            <ion-row v-if="selectedItem.code && selectedItem.exp">
              <ion-col size="6">
                <p style="font-weight: medium">
                  Code:
                  <span style="font-weight: normal">{{
                    selectedItem.code
                  }}</span>
                </p>
              </ion-col>
              <ion-col size="6" v-if="selectedItem.exp">
                Expire date: {{ formatExpDate(selectedItem.exp) }}
              </ion-col>
            </ion-row>
            <!-- Row for Title -->
            <ion-row>
              <ion-col size="12">
                <h4 style="font-weight: medium">{{ selectedItem.title }}</h4>
              </ion-col>
            </ion-row>
            <!-- Row for Timestamp -->
            <ion-row>
              <ion-col size="12">
                <ion-note>{{
                  formatTimestamp(selectedItem.timestamp?.toDate())
                }}</ion-note>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-content>
      </ion-modal>
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
  IonModal,
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
const isOpen = ref(false);
const selectedItem = ref({});

function formatTimestamp(date) {
  if (!date) return ""; // or some other default value

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

function formatExpDate(timestamp) {
  let date;
  if (timestamp && timestamp.toDate) {
    date = timestamp.toDate();
  } else {
    console.error("Invalid timestamp object:", timestamp);
    return "Invalid Date";
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const setOpen = (open, item = {}) => {
  isOpen.value = open;
  selectedItem.value = item;
};

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
