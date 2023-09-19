<template>
  <ion-page>
    <ion-header>
      <ion-toolbar style="background-color: #65bc50">
        <ion-title style="color: #fff"></ion-title>
        <div
          style="
            position: absolute;
            top: 0;
            right: 0;
            padding: 10px;
            color: #65bc50;
          "
        >
          {{ cyclCoins }} CC available
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content style="background-color: #f0f0f0">
      <div>
        <h2>Explore Great Discounts</h2>
      </div>
      <ion-list>
        <ion-item
          v-for="reward in rewards"
          :key="reward.id"
          style="
            position: relative;
            background-color: #fff;
            border-radius: 15px;
            margin: 10px;
            padding: 0;
            overflow: hidden;
          "
        >
          <img
            :src="reward.image"
            alt="reward image"
            style="width: 100%; height: 200px; object-fit: cover"
          />

          <div
            style="
              position: absolute;
              top: 10px;
              right: 10px;
              background-color: rgba(0, 0, 0, 0.5);
              color: #fff;
              padding: 5px 10px;
              border-radius: 5px;
              font-weight: bold;
            "
          >
            {{ reward.cost }} Cycl Coins
          </div>

          <div
            style="
              position: absolute;
              bottom: 0;
              background: linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.7),
                rgba(0, 0, 0, 0)
              );
              width: 100%;
              padding: 15px;
            "
          >
            <h2 style="color: #fff; margin: 0">{{ reward.title }}</h2>
            <p style="color: #fff; margin: 5px 0">{{ reward.about }}</p>
          </div>

          <div style="position: absolute; bottom: 10px; right: 10px">
            <ion-button
              style="--background: #31b46f; --border-radius: 20px"
              @click="activateCoupon(reward.cost)"
              >Activate Coupon</ion-button
            >
          </div>
        </ion-item>
        <div
          v-if="rewards.length === 0"
          style="text-align: center; padding: 20px"
        >
          <p>No rewards available at this time.</p>
        </div>
      </ion-list>
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
  IonItem,
  IonList,
  IonButton,
} from "@ionic/vue";
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
    IonItem,
    IonList,
    IonButton,
  },
  setup() {
    const rewards = ref([]);
    const cyclCoins = ref(null); // Added a ref to hold the CyclCoins balance
    const auth = getAuth(app);

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is logged in:", user);

        // Get user's CyclCoins balance from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            cyclCoins.value = userDoc.data().CyclCoins; // Replace `cyclCoins` with the actual field name in your Firestore
          } else {
            console.warn("User document does not exist");
          }
        } catch (error) {
          console.error("Error fetching user's CyclCoins:", error);
        }
      } else {
        console.log("No user is logged in");
      }
    });

    const fetchRewards = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "activatedStore"));
        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          if (data.image) {
            try {
              data.image = await getDownloadURL(
                storageRef(storage, data.image)
              );
            } catch (error) {
              console.error("Error fetching image URL:", error);
            }
          }
          rewards.value.push({ id: doc.id, ...data });
        }
      } catch (error) {
        console.error("Error fetching rewards:", error);
      }
    };

    onMounted(() => {
      fetchRewards();
    });

    const activateCoupon = (cost: number) => {
      console.log(`Coupon activated for ${cost} points`);
    };

    return {
      rewards,
      activateCoupon,
      cyclCoins,
    };
  },
});
</script>
