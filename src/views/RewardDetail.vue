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
        <ion-title
          style="
            color: #fff;
            text-align: center;
            font-size: 1.5em;
            margin: 0 auto;
          "
          >Details</ion-title
        >
      </ion-toolbar>
    </ion-header>

    <ion-content style="background-color: #f0f0f0; color: #000">
      <div v-if="reward" style="padding: 16px">
        <img
          :src="reward.image"
          alt="reward image"
          style="
            width: 100%;
            border-radius: 12px;
            margin-bottom: 16px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          "
        />

        <h2
          style="
            color: #31b46f;
            margin-bottom: 8px;
            font-size: 1.8rem;
            font-weight: 600;
          "
        >
          {{ reward.title }}
        </h2>

        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 16px;
            background-color: #ffffff;
            padding: 14px;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          "
        >
          <div>
            <p style="margin: 0; font-weight: 600; color: #65bc50">Cost</p>
            <p style="margin-top: 8px; color: #555555">
              {{ reward.cost }} Cycl Coins
            </p>
          </div>
          <div>
            <p style="margin: 0; font-weight: 600; color: #65bc50">
              Availability
            </p>
            <p style="margin-top: 8px; color: #555555">
              {{ reward.left }} left
            </p>
          </div>
        </div>

        <p style="margin-bottom: 8px; font-weight: 600; color: #31b46f">
          Website/Location
        </p>
        <p style="margin-bottom: 16px; line-height: 1.6">
          <a
            :href="reward.address"
            target="_blank"
            style="color: #31b46f; text-decoration: underline; cursor: pointer"
          >
            Show Location
          </a>
        </p>

        <p style="margin-bottom: 8px; font-weight: 600; color: #31b46f">
          Details
        </p>
        <p style="margin-bottom: 16px; line-height: 1.6">
          {{ reward.details }}
        </p>

        <ion-button
          @click="
            reward.type === 'donation' ? initiateDonation() : activateCoupon()
          "
          expand="full"
          style="
            background-color: #65bc50;
            color: #fff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            position: fixed;
            bottom: 16px;
            left: 16px;
            right: 16px;
            border-radius: 25px;
          "
        >
          {{ buttonLabel }}
        </ion-button>
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

import { defineComponent, ref, onMounted, computed } from "vue";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  collection,
  addDoc,
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

    const buttonStyle = computed(() => {
      return reward.value?.type === "donation"
        ? "background-color: #65bc50; color: #fff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); position: fixed; bottom: 16px; left: 16px; right: 16px; border-radius: 25px;"
        : "background-color: #65bc50; color: #fff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); position: fixed; bottom: 16px; left: 16px; right: 16px; border-radius: 25px;";
    });

    const buttonLabel = computed(() => {
      return reward.value?.type === "donation" ? "Donate" : "Activate Coupon";
    });

    async function initiateDonation() {
      const amount = window.prompt("Enter the amount you want to donate:");
      if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
        try {
          const auth = getAuth(app);
          const user = auth.currentUser;

          if (user) {
            // Step 1: Get current user CyclCoins
            const userDocRef = doc(db, "users", user.uid); // Adjust this with your user's collection path
            const userDoc = await getDoc(userDocRef);
            const currentUserCyclCoins = userDoc.data().CyclCoins;

            // Step 2: Deduct the donation amount from current user's CyclCoins
            if (currentUserCyclCoins >= Number(amount)) {
              await updateDoc(userDocRef, {
                CyclCoins: currentUserCyclCoins - Number(amount),
              });

              // Step 3: Log the donation in a subcollection under the user's document in Firestore
              const timestamp = new Date();
              const donationDetails = {
                title: reward.value.title, // Make sure to fetch the reward details properly
                image: reward.value.image, // Adjust with the correct path to fetch the image
                amount: Number(amount),
                timestamp: timestamp,
                userId: user.uid,
              };

              const userDonationsCollectionRef = collection(
                db,
                "users",
                user.uid,
                "history"
              );
              await addDoc(userDonationsCollectionRef, donationDetails);

              alert("Thank you for your donation!");
            } else {
              alert("Insufficient CyclCoins for donation.");
            }
          } else {
            alert("User not logged in.");
          }
        } catch (error) {
          console.error("Error initiating donation:", error);
          alert("An error occurred while initiating the donation.");
        }
      } else {
        alert("Invalid donation amount.");
      }
    }

    async function activateCoupon() {
      if (reward.value) {
        try {
          const auth = getAuth(app);
          const user = auth.currentUser;

          const id = route.params.id; // Get the 'id' from the route parameters

          if (user && id) {
            const confirmation = confirm(
              `Would you like to activate ${reward.value.title} for ${reward.value.cost} Cycl Coins?`
            );

            if (confirmation) {
              // Proceed with storing information in Firestore

              const userDocRef = doc(db, "users", user.uid);

              // Get current user CyclCoins
              const userDoc = await getDoc(userDocRef);
              const currentUserCyclCoins = userDoc.data().CyclCoins;

              // Ensure the user has enough Cycl Coins
              if (currentUserCyclCoins >= reward.value.cost) {
                // Deduct the reward cost from user's Cycl Coins
                await updateDoc(userDocRef, {
                  CyclCoins: currentUserCyclCoins - reward.value.cost,
                });

                // Prepare the data to store
                const timestamp = new Date();
                let activationDetails = {
                  title: reward.value.title,
                  image: reward.value.image,
                  amount: reward.value.cost,
                  timestamp: timestamp,
                };

                // Check if 'codes' field exists and add 'code' and 'exp' fields to activationDetails
                if (reward.value.codes && reward.value.codes.length > 0) {
                  activationDetails = {
                    ...activationDetails,
                    code: reward.value.codes[0], // Assuming 'codes' is an array. Adjust as needed.
                    exp: reward.value.exp, // Add 'exp' from reward.value
                  };

                  // Update the reward doc to remove the used code
                  const rewardDocRef = doc(db, "activatedStore", id);
                  await updateDoc(rewardDocRef, {
                    codes: arrayRemove(reward.value.codes[0]), // Remove the used code from the array
                  });
                }

                // Store the activation details in a "donations" subcollection under the user's document in Firestore
                const userDonationsCollectionRef = collection(
                  db,
                  "users",
                  user.uid,
                  "history"
                );
                await addDoc(userDonationsCollectionRef, activationDetails);

                // Reduce the availability of the reward by 1
                const rewardDocRef = doc(db, "activatedStore", id);
                await updateDoc(rewardDocRef, {
                  left: reward.value.left - 1,
                });

                alert("Coupon activated successfully!");
              } else {
                alert("Insufficient Cycl Coins.");
              }
            }
          } else {
            if (!user) {
              alert("User not logged in.");
            }
            if (!id) {
              alert("Reward ID is undefined.");
            }
          }
        } catch (error) {
          console.error("Error activating coupon:", error);
          alert("An error occurred while activating the coupon.");
        }
      }
    }

    return {
      reward,
      buttonStyle,
      buttonLabel,
      initiateDonation, // Make this available in your template
      activateCoupon,
    };
  },
});
</script>
