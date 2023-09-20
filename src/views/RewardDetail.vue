<template>
  <ion-page>
    <ion-header>
      <ion-toolbar style="background-color: #65bc50">
        <ion-buttons slot="start">
          <ion-back-button
            defaultHref="/rewards"
            style="color: #fff"
          ></ion-back-button>
        </ion-buttons>
        <ion-title style="color: #fff">Reward Detail</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content style="background-color: #31b46f; color: #fff">
      <div v-if="reward" style="padding: 16px">
        <img
          :src="reward.image"
          alt="reward image"
          style="width: 100%; border-radius: 10px; margin-bottom: 16px"
        />

        <h2 style="color: #fff; margin-bottom: 8px">{{ reward.title }}</h2>

        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
            background-color: #65bc50;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          "
        >
          <div>
            <p style="margin: 0; font-weight: bold">Cost</p>
            <p style="margin-top: 8px">{{ reward.cost }} Cycl Coins</p>
          </div>
          <div>
            <p style="margin: 0; font-weight: bold">Availability</p>
            <p style="margin-top: 8px">{{ reward.left }} left</p>
          </div>
        </div>

        <p style="margin-bottom: 8px; font-weight: bold; color: #65bc50">
          About
        </p>
        <p style="margin-bottom: 16px">{{ reward.about }}</p>

        <p style="margin-bottom: 8px; font-weight: bold; color: #65bc50">
          Details
        </p>
        <p style="margin-bottom: 16px">{{ reward.details }}</p>

        <ion-button
          @click="activateCoupon"
          expand="full"
          style="
            background-color: #65bc50;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          "
          >Activate Coupon</ion-button
        >
      </div>
      <div v-else style="padding: 16px">
        <p>Loading reward details...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons, // Make sure this line is here
  IonBackButton,
} from "@ionic/vue";
import { useRoute } from "vue-router"; // Make sure to import useRoute here

import { defineComponent, ref, onMounted } from "vue";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
} from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "vue-router";

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
const storage = getStorage(app);
export default defineComponent({
  components: {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
  },
  setup() {
    const route = useRoute();
    const reward = ref<any>(null);

    onMounted(async () => {
      const id = route.params.id;
      try {
        const docRef = doc(db, "activatedStore", id); // Adjust with your Firestore collection path
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          reward.value = docSnapshot.data();
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error getting document:", error);
      }
    });

    function activateCoupon() {
      if (reward.value) {
        console.log(`Coupon activated for ${reward.value.cost} points`);
      }
    }

    return {
      reward,
      activateCoupon, // Make this available in your template
    };
  },
});
</script>
