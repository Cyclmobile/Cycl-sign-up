<template>
  <ion-page>
    <ion-header>
      <ion-toolbar style="background-color: #65bc50; position: relative">
        <ion-title
          style="
            color: #fff;
            text-align: left;
            font-size: 1.5em;
            margin: 0 auto;
          "
          >Rewards</ion-title
        >
        <div
          style="
            position: absolute;
            top: 50%;
            right: 16px;
            transform: translateY(-50%);
            padding: 10px;
            color: #fff;
            font-weight: bold;
          "
        >
          {{ cyclCoins }} CC available
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content style="background-color: #f0f0f0; padding: 16px">
      <IonLoading :is-open="loading" message="Fetching rewards..."></IonLoading>
      <div style="margin-bottom: 16px; text-align: center">
        <h2
          style="
            font-weight: bold;
            color: #333;
            font-size: 1.7em;
            letter-spacing: -0.02em;
          "
        >
          Explore Great Discounts
        </h2>
      </div>
      <ion-list>
        <ion-item
          v-for="reward in rewards"
          :key="reward.id"
          @click="activateCoupon(reward)"
          style="
            position: relative;
            background-color: #fff;
            border-radius: 15px;
            margin: 10px 0;
            padding: 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            cursor: pointer;
          "
        >
          <img
            :src="reward.image"
            alt="reward image"
            style="
              width: 100%;
              height: 200px;
              object-fit: cover;
              border-radius: 15px 15px 0 0;
            "
          />

          <div
            v-if="reward.type !== 'donation'"
            style="
              position: absolute;
              top: 10px;
              right: 20px;
              background-color: rgba(0, 0, 0, 0.7);
              color: #fff;
              padding: 5px 10px;
              border-radius: 50px;
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
            <h2
              style="
                color: #fff;
                margin: 0;
                font-size: 1.2em;
                font-weight: bold;
                line-height: 1.3;
              "
            >
              {{ reward.title }}
            </h2>
            <p
              style="
                color: #fff;
                margin: 5px 0 0 0;
                font-size: 1em;
                line-height: 1.4;
              "
            >
              {{ reward.about }}
            </p>
            <p
              v-if="reward.type !== 'donation'"
              style="
                color: #fff;
                margin: 5px 0 0 0;
                font-size: 1em;
                font-weight: bold;
              "
            >
              {{ reward.left }} left
            </p>
          </div>

          <div style="position: absolute; bottom: 15px; right: 15px">
            <ion-button
              :style="
                reward.type === 'donation'
                  ? '--background: #31b46f; --border-radius: 20px; font-weight: bold'
                  : '--background: #31b46f; --border-radius: 20px; font-weight: bold'
              "
              @click.stop="activateCoupon(reward)"
            >
              {{ getButtonText(reward.type) }}
            </ion-button>
          </div>
        </ion-item>

        <div
          v-if="rewards.length === 0"
          style="text-align: center; padding: 20px"
        >
          <p style="color: #333; font-size: 1.2em; font-weight: bold">
            No rewards available at this time.
          </p>
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
  IonLoading,
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
    IonItem,
    IonList,
    IonButton,
  },
  setup() {
    const rewards = ref([]);
    const cyclCoins = ref(null); // Added a ref to hold the CyclCoins balance
    const auth = getAuth(app);
    const router = useRouter();
    const loading = ref(false);

    const getButtonText = (type: string) => {
      return type === "donation" ? "Donate" : "Activate Coupon";
    };

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
      loading.value = true; // Set loading to true before fetching

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
      } finally {
        loading.value = false; // Set loading to false after fetching is done
      }
    };

    onMounted(() => {
      fetchRewards();
    });

    // const activateCoupon = (cost: number) => {
    //   console.log(`Coupon activated for ${cost} points`);
    // };
    const activateCoupon = (reward: any) => {
      router.push({ name: "RewardDetail", params: { id: reward.id } });
    };

    return {
      rewards,
      activateCoupon,
      cyclCoins,
      loading,
      getButtonText,
    };
  },
});
</script>
