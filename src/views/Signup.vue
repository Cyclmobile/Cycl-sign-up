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
          <ion-item>
            <ion-label position="floating">Name</ion-label>
            <ion-input v-model="name"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Password</ion-label>
            <ion-input type="password" v-model="password"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="floating">Age</ion-label>
            <ion-input v-model="age"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label>Gender</ion-label>
            <ion-select v-model="gender">
              <ion-select-option value="male">Male</ion-select-option>
              <ion-select-option value="female">Female</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-button
            expand="full"
            @click="signUp"
            :style="{ '--background': '#31b46f' }"
            >Sign Up</ion-button
          >
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script>
import { ref } from "vue";
import app from "@/firebase.js"; // Import the initialized Firebase app
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
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

    const signUp = async () => {
      try {
        const userEmail = email.value.trim();
        const userPassword = password.value.trim();

        console.log(`Email: ${userEmail}, Password: ${userPassword}`);

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userEmail,
          userPassword
        );

        const user = userCredential.user;

        // Once authenticated, save additional data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: name.value,
          age: age.value,
          gender: gender.value,
        });

        console.log("User created successfully");
      } catch (error) {
        console.error("Error signing up: ", error.message);
      }
    };

    return {
      name,
      email,
      password,
      age,
      gender,
      signUp,
    };
  },
};
</script>

<style>
.toolbar-logo {
  max-width: 150px;
  height: auto;
}
.ion-card {
  background-color: #31b46f;
}
</style>
