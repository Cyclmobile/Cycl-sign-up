<template>
  <ion-page>
    <ion-header> </ion-header>

    <ion-content
      :style="{ '--background': '#65bc50' }"
      class="ion-padding"
      fullscreen="true"
    >
      <div class="logo-container">
        <img src="/196.png" alt="Logo" />
      </div>

      <ion-card>
        <ion-card-content>
          <div class="social-login-container">
            <ion-button
              expand="full"
              :style="{ '--background': '#4285F4' }"
              @click="loginWithGoogle"
              >Login with Google</ion-button
            >
            <ion-button
              expand="full"
              :style="{ '--background': '#000000' }"
              @click="loginWithApple"
              >Login with Apple</ion-button
            >
            <ion-button
              expand="full"
              :style="{ '--background': '#3b5998' }"
              @click="loginWithFacebook"
              >Login with Facebook</ion-button
            >
          </div>

          <div class="or-container">
            <span>or</span>
          </div>

          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Password</ion-label>
            <ion-input type="password" v-model="password"></ion-input>
          </ion-item>

          <ion-button
            expand="full"
            @click="login"
            :style="{ '--background': '#31b46f' }"
            >Login</ion-button
          >
          <p class="signup-text">
            Don't have an account?
            <router-link to="signup">Sign up</router-link>
          </p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from "vue";
import app from "@/firebase.js"; // Import the initialized Firebase app
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // <-- make sure to import this method
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default {
  setup() {
    const email = ref("");
    const password = ref("");

    const login = async () => {
      try {
        const auth = getAuth();
        await signInWithEmailAndPassword(auth, email.value, password.value);
        console.log("Login successful");
      } catch (error) {
        console.error("Login failed: ", error);
      }
    };

    const loginWithGoogle = () => {
      console.log("Login with Google");
      // Implement Google login
    };

    const loginWithApple = () => {
      console.log("Login with Apple");
      // Implement Apple login
    };

    const loginWithFacebook = () => {
      console.log("Login with Facebook");
      // Implement Facebook login
    };

    return {
      email,
      password,
      login,
      loginWithGoogle,
      loginWithApple,
      loginWithFacebook,
    };
  },
};
</script>

<style>
.ion-card {
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: auto;
  max-width: 400px;
  width: 100%;
}

.logo-container {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
}

.logo-container img {
  max-width: 150px;
  height: auto;
}

.social-login-container ion-button {
  margin-bottom: 10px;
}

.or-container {
  text-align: center;
  margin: 20px 0;
  font-size: 14px;
  color: #888;
}

.signup-text {
  text-align: center;
  margin-top: 10px;
  color: #888;
}

.signup-text a {
  color: #31b46f;
}
.toolbar-logo {
  max-width: 150px;
  height: auto;
}
</style>
