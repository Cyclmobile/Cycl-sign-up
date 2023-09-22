<template>
  <ion-page>
    <ion-content class="login-background">
      <!-- Slide Show -->
      <ion-slides pager="true" options="{initialSlide: 0, speed: 400}">
        <!-- <ion-slide>
          <img src="path/to/your/image1.jpg" alt="Image 1" />
          <p class="slide-text" style="color: #65bc50">Text for image 1</p>
        </ion-slide>
        <ion-slide>
          <img src="path/to/your/image2.jpg" alt="Image 2" />
          <p class="slide-text" style="color: #31b46f">Text for image 2</p>
        </ion-slide> -->
        <ion-slide>
          <!-- Login Form -->
          <ion-button
            expand="full"
            style="margin-top: 20px"
            @click="googleLogin"
          >
            Login with Google
          </ion-button>

          <div class="login-container">
            <ion-item>
              <IonInput v-model="email" placeholder="Email" />
            </ion-item>
            <ion-item>
              <IonInput
                v-model="password"
                placeholder="Password"
                type="password"
              />
            </ion-item>
            <ion-button expand="full" style="margin-top: 20px" @click="login">
              Login
            </ion-button>
            <ion-text style="color: #65bc50; text-align: center">
              <a @click="goToSignup">Sign Up</a>
            </ion-text>
          </div>
        </ion-slide>
      </ion-slides>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
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
  },
  setup() {
    const email = ref("");
    const password = ref("");
    const router = useRouter();
    const showAlert = ref(false);
    const provider = new GoogleAuthProvider();

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

    onMounted(() => {
      const tabBar = document.querySelector("ion-tab-bar");
      if (tabBar) {
        tabBar.style.display = "none";
      }
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
    };
  },
};
</script>

<style>
.login-background {
  --background: #65bc50; /* Adjust as needed */
}

.slide-text {
  text-align: center;
  font-size: 1.2em;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

ion-item {
  --background: #fff;
  --padding-start: 20px;
  --padding-end: 20px;
  margin-bottom: 20px;
}

ion-button {
  --background: #31b46f;
}

ion-text a {
  text-decoration: underline;
  cursor: pointer;
}
</style>
