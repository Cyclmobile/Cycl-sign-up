<template>
  <ion-page>
    <ion-content class="login-background" no-bounce>
     <swiper :options="swiperOptions" ref="swiper">
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
      src="https://lottie.host/?file=b33cffe8-f41e-4eee-80d1-35a79f98361f/JqSyRZPxvc.lottie"
    ></iframe>
    <div class="text-container">
      <h1 class="slide-title">Recycling Station</h1>
      <p class="slide-text">Find nearby Recycling station</p>
    </div>
<ion-button style="z-index: 1000;" class="skip-button" @click="skipToLogin">
 <ion-icon aria-hidden="true" :icon="playForwardOutline" />
    Skip to Login
</ion-button>
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
              src="https://lottie.host/?file=3e495134-f97e-4560-a243-79762a4c9f9d/tTntzKkOdj.lottie"
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
              src="https://lottie.host/?file=c764fae3-ae10-4471-8db6-2691f2c7380c/LNc3YKsxy5.lottie"
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
              src="https://lottie.host/?file=8ac28ac4-af28-4218-a95b-011641230fce/DVYHKLv4CL.lottie"
            ></iframe>
             <div class="text-container"> 
            <p class="slide-text">
               <h1 class="slide-title">Recycling Station</h1>
              do not move your hand from camera to prevent
              losing points, wait for the signal then you done
            </p>
            </div>
          </div>
              </swiper-slide>
        <swiper-slide>

  <div class="login-container">
    <!-- Google Login -->
    <ion-button expand="full" class="google-button" @click="googleLogin">
          <ion-icon aria-hidden="true" :icon="logoGoogle"/>
      Login with Google
    </ion-button>
    
    <!-- Facebook Login -->
    <!-- <ion-button expand="full" class="facebook-button" >
          <ion-icon aria-hidden="true" :icon="logoFacebook" />
      Login with Facebook
    </ion-button> -->

  <ion-button expand="full" class="apple-button" v-if="isIOS" @click="appleLogin">
      <ion-icon aria-hidden="true" :icon="logoApple" />
  Login with Apple
</ion-button>

    <div class="email-login-container">
      <ion-item>
        <ion-input v-model="email" placeholder="Email" />
      </ion-item>
      <ion-item>
        <ion-input v-model="password" placeholder="Password" type="password" />
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
import { isPlatform } from '@ionic/vue';
import { ref, onMounted, onBeforeUnmount, nextTick,computed } from "vue";
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
  IonIcon,
} from "@ionic/vue";
import { logoGoogle, logoFacebook,logoApple,arrowForward,playForwardOutline} from 'ionicons/icons';

import {
  getAuth,
  signInWithEmailAndPassword,
  initializeAuth,
  indexedDBLocalPersistence,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { Capacitor } from "@capacitor/core";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";



// Your firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpkOhaK9xqJoynNcq22EVSE44y5DebCSI",
  authDomain: "cycl-ionic.firebaseapp.com",
  projectId: "cycl-ionic",
  storageBucket: "cycl-ionic.appspot.com",
  messagingSenderId: "310990335294",
  appId: "1:310990335294:web:c8cb7e850a93d94854d06f",
  measurementId: "G-BSWJX4TVBF"
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
    const appleProvider = new OAuthProvider('apple.com');
    


     const isIOS = computed(() => {
      return isPlatform('ios');
    });

    
     const goToSignup = () => {
      router.replace('/tabs/signup');
    };

     const currentSlideIndex = ref(0);
const swiper = ref(null); // create a ref to hold the swiper instance



    // Lottie options
    const lottieOptions = {
      path: "https://lottie.host/?file=d47df551-23bb-4c32-8b14-b41b1914756c/QON4d0Zl6J.json", // path to the Lottie JSON file
      loop: true, // whether animation should loop
      autoplay: false, // whether animation should autoplay
    };

    const googleLogin = async () => {
  try {
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    console.log("User successfully logged in with Google:", user);
     const tabBar = document.querySelector("ion-tab-bar");
    if (tabBar) {
      tabBar.style.display = "flex";
    }
await checkAndStoreUser(user);

  } catch (error) {
    console.error("Error logging in with Google:", error);
  }
};

const checkAndStoreUser = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);
    
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
  }
};





 const appleLogin = async () => {
  try {
    const userCredential = await signInWithPopup(auth, appleProvider);
    const user = userCredential.user;
    console.log("User successfully logged in with Apple:", user);
    
    // Check and save user to Firestore if they don't exist
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });
    }
    
    // Navigate to main page or any other required functionality
  } catch (error) {
    console.error("Error logging in with Apple:", error);
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

  



    onMounted(async () => {
      await nextTick(); // Wait for the DOM to be updated
          swiper.value = document.querySelector('.swiper').swiper;


      const slides = document.querySelector("ion-slides");
      if (slides && slides.swiper) {
        slides.swiper.update();
      }

      const tabBar = document.querySelector("ion-tab-bar");
      if (tabBar) {
        tabBar.style.display = "none";
      }

        // Get the currently logged-in user
    const auth = getAuth(app);
     const user = auth.currentUser;
  if (user) {
    // Redirect to tab1 if the user is logged in
    router.replace("tab1");
  }
  document.body.classList.add("hide-tab-bar");

   
    });

     const skipToLogin = () => {
    if (swiper.value) {
      swiper.value.slideTo(4); // navigate to the 5th slide (0-index)
    }
  };

    onBeforeUnmount(() => {
      document.body.classList.remove("hide-tab-bar");

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
         const tabBar = document.querySelector("ion-tab-bar");
    if (tabBar) {
      tabBar.style.display = "flex";
    }
      } catch (error) {
        console.error("Login failed", error);
      }
    };

  

    return {
      email,
      password,
      login,
      showAlert,
      goToSignup,
      googleLogin,
      lottieOptions,
      appleLogin,
      preventLastSlideSwiping,
      swiperOptions: {
        initialSlide: 0,
        speed: 400,
        direction: "horizontal",
          touchAction: 'pan-x',
      },
       logoGoogle,
       logoApple,
       logoFacebook,
       skipToLogin,
             isIOS,

    };
  },
};
</script>

<style>
body.hide-tab-bar ion-tab-bar {
  display: none !important;
}

.skip-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

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
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

}

ion-button:hover {
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15);
    transform: scale(0.95);

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
body {
  /* Prevent vertical scrolling */
  overflow-y: hidden;
}

.button-icon {
  height: 20px;
  margin-right: 10px;
}

.google-button {
  --background: #4285F4; /* Google's brand color */
  color: white;
}

.facebook-button {
  --background: #4267B2; /* Facebook's brand color */
  color: white;
}

.apple-button {
  --background: #000; /* Apple's brand color */
  color: white;
}

/* Additional Styling */
.login-container {
  width: 80%;
  border-radius: 20px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  background-color: #ffffff;
  padding: 20px;
}

.email-login-container {
  margin-top: 20px;
}

ion-button {
  margin: 10px 0;
  --padding-start: 15px;
  --padding-end: 15px;
}

ion-item {
  --background: #f0f0f0;
}


</style>

