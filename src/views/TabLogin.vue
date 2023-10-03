<template>
  <ion-page>
    <ion-content class="login-background">
      <swiper :options="swiperOptions">
        <!-- First Slide with Lottie Animation -->
        <swiper-slide>
       <div class="slide-content">
    <iframe
      style="
        pointer-events: none;
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        height: 100%;
        width: 100%;
        border: none;
      "
      src="https://lottie.host/?file=d47df551-23bb-4c32-8b14-b41b1914756c/QON4d0Zl6J.json"
    ></iframe>
    <div class="text-container">
      <h1 class="slide-title">Recycling Station</h1>
      <p class="slide-text">Find nearby Recycling station</p>
    </div>
  </div>
        </swiper-slide>

        <swiper-slide>
          <div class="slide-content">
            <iframe
              style="
                pointer-events: none;
                position: fixed;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                height: 100%;
                width: 100%;
                border: none;
              "
              src="https://lottie.host/?file=c1b5a1dd-7a76-4497-a586-0507f8e63622/eylqSqZXnx.json"
            ></iframe>
             <div class="text-container"> 
               <h1 class="slide-title">Scan bottle</h1>
            <p class="slide-text">Scan Your bottle</p>
             </div>
            
          </div>
        </swiper-slide>

        <swiper-slide>
          <div class="slide-content">
            <iframe
              style="
                pointer-events: none;
                position: fixed;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                height: 100%;
                width: 100%;
                border: none;
              "
              src="https://lottie.host/?file=1841efff-2213-40ce-a8ca-53396fc889fb/BmMNxKGNS5.json"
            ></iframe>
             <div class="text-container"> 
             <h1 class="slide-title">Recycling Station</h1>
            <p class="slide-text">
              Hold Your bottle on top of the hole and your phone on with camera
              running on top
            </p>
            </div>
          </div>
        </swiper-slide>

        <swiper-slide>
          <div class="slide-content">
            <iframe
              style="
                pointer-events: none;
                position: fixed;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                height: 100%;
                width: 100%;
                border: none;
              "
              src="https://lottie.host/?file=b5c9094c-83b6-4a37-949f-333d73fe1034/LeMiwPeO9x.json"
            ></iframe>
             <div class="text-container"> 
            <p class="slide-text">
               <h1 class="slide-title">Recycling Station</h1>
              Drop you bottle and do not move your hand from camera to prevent
              losing points, wait for the signal then you done
            </p>
            </div>
          </div>
        </swiper-slide>
        <!-- Onboarding Slides -->
        <!-- <swiper-slide v-for="path in imagePaths" :key="path">
          <div class="slide-content">
            <img :src="path" :alt="path" class="slide-image" />
            <p class="slide-text">Text for {{ path }}</p>
          </div>
        </swiper-slide> -->

        <!-- Login Slide -->
        <swiper-slide>
          <div class="login-container">
            <ion-button expand="full" @click="googleLogin">
              Login with Google
            </ion-button>
            <div class="login-container">
              <ion-item>
                <ion-input v-model="email" placeholder="Email" />
              </ion-item>
              <ion-item>
                <ion-input
                  v-model="password"
                  placeholder="Password"
                  type="password"
                />
              </ion-item>
              <ion-button expand="full" @click="login">Login</ion-button>
              <ion-text>
                <a @click="goToSignup">Sign Up</a>
              </ion-text>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import Lottie from "lottie-vuejs"; // Import Lottie

import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonPage,
  IonText,
  IonAlert,
} from "@ionic/vue";
import {
  getAuth,
  signInWithEmailAndPassword,
  initializeAuth,
  indexedDBLocalPersistence,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { Capacitor } from "@capacitor/core";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

// Your firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3KjQPSVjw0PTwn1AkKdPLlW6yyom3_GE",
  authDomain: "wifiyer.firebaseapp.com",
  projectId: "wifiyer",
  storageBucket: "wifiyer.appspot.com",
  messagingSenderId: "409869290584",
  appId: "1:409869290584:web:36bf46c2e3ecb098610e2d",
  measurementId: "G-7GLD6P4N2G",
};

// Initialize Firebase directly
const app = initializeApp(firebaseConfig);
let auth;
const db = getFirestore(app);

try {
  if (Capacitor.isNativePlatform()) {
    auth = getAuth(app);
    auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
  } else {
    auth = getAuth(app);
  }
} catch (error) {
  if (error.code !== "auth/already-initialized") {
    console.error("Unexpected error during auth initialization", error);
  }
}

export default {
  components: {
    IonContent,
    IonPage,
    IonButton,
    IonInput,
    IonItem,
    IonText,
    IonAlert,
    Swiper,
    SwiperSlide,
    Lottie,
  },
  setup() {
    const email = ref("");
    const password = ref("");
    const router = useRouter();
    const showAlert = ref(false);
    const provider = new GoogleAuthProvider();

    // Lottie options
    const lottieOptions = {
      path: "https://lottie.host/?file=d47df551-23bb-4c32-8b14-b41b1914756c/QON4d0Zl6J.json", // path to the Lottie JSON file
      loop: true, // whether animation should loop
      autoplay: true, // whether animation should autoplay
    };

    const googleLogin = async () => {
      try {
        const userCredential = await signInWithPopup(auth, provider);
        // The signed-in user info.
        const user = userCredential.user;
        console.log("User successfully logged in with Google:", user);
        router.push("tab1");
      } catch (error) {
        console.error("Error logging in with Google:", error);
      }
    };

    const preventLastSlideSwiping = async () => {
      const slides = document.querySelector("ion-slides");
      if (slides) {
        const swiper = await slides.getSwiper(); // Use the getSwiper method from Ionic
        const currentIndex = swiper.activeIndex;

        if (currentIndex === imagePaths.value.length) {
          swiper.allowSlidePrev = false; // prevent going back
          swiper.allowSlideNext = false; // prevent going further
        } else {
          swiper.allowSlidePrev = true;
          swiper.allowSlideNext = true;
        }
      }
    };

    // Get the currently logged-in user
    const auth = getAuth(app);

    const user = auth.currentUser;
    console.log(user);
    // login user if user already signed in
    // router.replace("tab1");

    if (!user) {
      // Redirect to login if the user is not logged in
      router.replace("login"); // Adjust with your router setup
    }

    onMounted(async () => {
      await nextTick(); // Wait for the DOM to be updated

      const slides = document.querySelector("ion-slides");
      if (slides && slides.swiper) {
        slides.swiper.update();
        console.log("Updated!!!")
      }

      // const tabBar = document.querySelector("ion-tab-bar");
      // if (tabBar) {
      //   tabBar.style.display = "none";
      // }
    });

    onBeforeUnmount(() => {
      const tabBar = document.querySelector("ion-tab-bar");
      if (tabBar) {
        tabBar.style.display = "";
      }
    });

    const signInUser = async (email: string, password: string) => {
      try {
        console.log(
          "signInUser function called with email:",
          email,
          "and password:",
          password
        );
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log("User authenticated successfully:", userCredential.user);
        return userCredential.user;
      } catch (error) {
        console.log("Error in signInUser function:", error);
        throw error;
      }
    };

    const login = async () => {
      try {
        console.log("Attempting to login with email:", email.value);

        // Step 1: Sign-in the user
        const user = await signInUser(email.value, password.value);
        console.log("User signed in successfully, User ID:", user.uid);

        // Step 2: Getting user document reference
        const docRef = doc(db, "users", user.uid);
        console.log("Document reference obtained:", docRef);

        // Step 3: Fetching the user document
        const docSnap = await getDoc(docRef);
        console.log("Document snapshot obtained:", docSnap);

        if (docSnap.exists()) {
          console.log("User data exists:", docSnap.data());
        } else {
          console.log("No such document, creating new document...");
          await setDoc(docRef, { email: user.email });
          console.log("New document created successfully");
        }

        showAlert.value = true;
        console.log("User data fetch successful, redirecting...");
        router.replace("tab1");
      } catch (error) {
        console.error("Login failed", error);
      }
    };

    const goToSignup = () => {
      router.replace("/signup");
    };

    return {
      email,
      password,
      login,
      showAlert,
      goToSignup,
      googleLogin,
      lottieOptions,
      imagePaths: [
        "/196.png",
        "/216.png",
        "/favicon.png",
        "privacy.png",
        "/terms.png",
      ],
      preventLastSlideSwiping,
      swiperOptions: {
        initialSlide: 0,
        speed: 400,
        direction: "horizontal",
      },
    };
  },
};
</script>

<style>
.slide-title {
  color: #40b967; /* dark color for title */
  font-family: 'Roboto', sans-serif;
  font-size: 1.5em;
  font-weight: 500;
  margin-bottom: 10px;
  text-align: left;
}

.text-container {
  position: absolute;
  bottom: 10%;
  left: 5%;
  width: 90%;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 15px; 
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
}

.login-background {
  --background: linear-gradient(135deg, #f6f7f9 0%, #d9e4dd 100%);
  height: 100vh; /* take up the full viewport height */
  display: flex;
  flex-direction: column;
}

.swiper-slide {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.slide-text {
  color: #555; /* slightly lighter color for text */
  font-family: 'Roboto', sans-serif;
  font-size: 1em;
  text-align: left;
}

.slide-image {
  width: 100vw;
  height: 100vh;
  object-fit: contain; /* Makes sure the entire image is visible */
  object-position: center; /* Ensures the image remains centered */
}

.slide-image:hover {
  transform: scale(1.05);
}

.slide-content,
.login-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

ion-item {
  --background: rgba(255, 255, 255, 0.8);
  --padding-start: 20px;
  --padding-end: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease-in-out;
}

ion-item:hover {
  box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.15);
}

ion-button {
  --background: linear-gradient(135deg, #31b46f 0%, #28a965 100%);
  border-radius: 10px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease-in-out;
}

ion-button:hover {
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15);
}

ion-text a {
  text-decoration: none;
  cursor: pointer;
  color: #31b46f;
  transition: color 0.2s ease-in-out;
}

ion-text a:hover {
  color: #28a965;
}

ion-content {
  --background: #f6f7f9;
  height: 100vh;
}

/* Styles for larger screens (like tablets) */
@media (min-width: 720px) {
  .slide-image {
    width: 50%;
  }
}

/* Styles specific to smartphones */
@media (max-width: 719px) {
  .slide-image {
    width: 80%;
  }

  .slide-text {
    font-size: 1.2em; /* Adjust font-size for smaller screens */
  }
}
</style>
