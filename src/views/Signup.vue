<template>
  <ion-page>
    <ion-header></ion-header>

    <ion-content :style="{ '--background': '#65bc50' }" class="ion-padding" fullscreen="true">
      <div class="logo-container">
        <img src="/196.png" alt="Logo" />
      </div>

      <ion-card>
        <ion-card-content>
          <ion-item>
            <ion-label position="floating">Name</ion-label>
            <ion-input :value="name" @input="name=$event.target.value;" type="text"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input :value="email" @input="email=$event.target.value;" type="email"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Password</ion-label>
            <ion-input :value="password" @input="password=$event.target.value;" type="password"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Age</ion-label>
            <ion-input :value="age" @input="age=$event.target.value;" type="number"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label>Gender</ion-label>
            <ion-select @input="gender=$event.target.value;" v-model="gender">
              <ion-select-option value="male">Male</ion-select-option>
              <ion-select-option value="female">Female</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-button expand="full" @click="signUp" :style="{ '--background': '#31b46f' }">Sign Up</ion-button>
          <ion-button expand="full" @click="googleLogin" :style="{ '--background': '#31b46f' }">Google Signup</ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import app from "@/firebase.js"; // Import the initialized Firebase app
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, getRedirectResult, signInWithRedirect } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export default {
  setup() {
    const name = ref("");
    const email = ref("");
    const password = ref("");
    const age = ref(null);
    const gender = ref("");

    const auth = getAuth(app); // Pass the initialized app instance
    const db = getFirestore(app); // Pass the initialized app instance

    const router = useRouter();

    const gProvider = new GoogleAuthProvider();

    const signUp = async () => {
      try {
        const userEmail = email.value.trim();
        const userPassword = password.value.trim();

        console.log(`Email: ${userEmail}, Password: ${userPassword}`);

        const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);

        const user = userCredential.user;

        // Once authenticated, save additional data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: name.value,
          age: age.value,
          gender: gender.value,
        });

        console.log("User created successfully");
        router.push('/tabs/tab1')
      } catch (error) {
        console.error("Error signing up: ", error.message);
      }
    };

    const googleLogin = async () => {
      try {
        
        await signInWithRedirect(auth, gProvider);

        const result = await getRedirectResult(auth);

        if(result?.user){
          const user = result.user;
          console.log("Google Sign-In successful. User:", user);
          router.push('/tabs/tab1')

        }
      } catch (error) {
        console.error("Error logging in with Google:", error);
      }
    };


    return {
      name,
      email,
      password,
      age,
      gender,
      signUp,
      googleLogin,
    };
  },
};
</script>

<style scoped>
.toolbar-logo {
  max-width: 150px;
  height: auto;
}
.ion-card {
  background-color: #31b46f;
}
</style>
