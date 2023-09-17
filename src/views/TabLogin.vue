<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="social-login-options">
        <ion-button @click="signInWithProvider('facebook')" expand="block">
          <ion-icon :icon="logoFacebook" slot="start" />
          Login with Facebook
        </ion-button>
        <ion-button @click="signInWithProvider('google')" expand="block">
          <ion-icon :icon="logoGoogle" slot="start" />
          Login with Google
        </ion-button>
        <ion-button @click="signInWithProvider('apple')" expand="block">
          <ion-icon :icon="logoApple" slot="start" />
          Login with Apple
        </ion-button>
      </div>
      <p class="or-text">OR</p>
      <form @submit.prevent="loginWithEmail">
        <ion-item>
          <ion-label>Email</ion-label>
          <ion-input v-model="email" type="email"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label>Password</ion-label>
          <ion-input v-model="password" type="password"></ion-input>
        </ion-item>
        <ion-button type="submit" expand="block">Login with Email</ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<!-- <script lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
} from "@ionic/vue";
import { defineComponent, ref, onMounted } from "vue";
import {
  signInWithRedirect,
  signInWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { logoFacebook, logoGoogle, logoApple } from "ionicons/icons";
import { auth } from "firebase/auth";
import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
  },
  setup() {
    const email = ref("");
    const password = ref("");
    const router = useRouter();

    const signInWithProvider = async (providerName) => {
      let provider;
      if (providerName === "facebook") {
        provider = new FacebookAuthProvider();
      } else if (providerName === "google") {
        provider = new GoogleAuthProvider();
      } else if (providerName === "apple") {
        provider = new OAuthProvider("apple.com");
      } else {
        console.error("Invalid provider name");
        return;
      }

      try {
        await signInWithRedirect(auth, provider);
      } catch (error) {
        console.error("Error signing in:", error);
      }
    };

    const loginWithEmail = async () => {
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        router.push("/tabs/tab1");
      } catch (error) {
        console.error("Error signing in with email:", error);
        alert(error.message);
      }
    };

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result.user) {
          router.push("/tabs/tab1");
        }
      } catch (error) {
        console.error("Error from redirect:", error);
      }
    };

    onMounted(() => {
      handleRedirectResult();
    });

    return {
      email,
      password,
      signInWithProvider,
      loginWithEmail,
      logoFacebook,
      logoGoogle,
      logoApple,
    };
  },
});
</script> -->

<style scoped>
.social-login-options {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.or-text {
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
}
</style>
