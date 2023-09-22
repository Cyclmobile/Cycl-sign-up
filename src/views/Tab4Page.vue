<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Recycled Bottles Count -->
      <div class="recycled-bottles">
        <h2>You have recycled <span>150</span> bottles</h2>
      </div>

      <!-- User Details -->
      <ion-list>
        <ion-item>
          <ion-icon aria-hidden="true" :icon="personOutline" />
          <ion-label>Username</ion-label>
          <ion-text slot="end">YourUsername</ion-text>
        </ion-item>
        <ion-item>
          <ion-icon aria-hidden="true" :icon="mailOutline" />
          <ion-label>Email</ion-label>
          <ion-text slot="end">youremail@example.com</ion-text>
        </ion-item>
      </ion-list>

      <!-- Other Options -->
      <ion-list>
        <ion-item @click="navigateTo('recycle-history')">
          <ion-icon aria-hidden="true" :icon="leaf" />
          Recycle History
        </ion-item>
        <ion-item @click="navigateTo('how-to-recycle')">
          <ion-icon aria-hidden="true" :icon="informationCircleOutline" /> How
          to Recycle
        </ion-item>
        <ion-item @click="navigateTo('terms-of-use')">
          <ion-icon aria-hidden="true" :icon="documentTextOutline" /> Terms of
          Use
        </ion-item>
        <ion-item @click="navigateTo('policy')">
          <ion-icon aria-hidden="true" :icon="shieldOutline" /> Policy
        </ion-item>
        <ion-item @click="navigateTo('help')">
          <ion-icon aria-hidden="true" :icon="helpCircleOutline" /> Help
        </ion-item>
        <ion-item @click="logout">
          <ion-icon aria-hidden="true" :icon="logOutOutline" /> Logout
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonIcon,
} from "@ionic/vue";

import {
  personOutline,
  mailOutline,
  recycleOutline,
  informationCircleOutline,
  documentTextOutline,
  shieldOutline,
  helpCircleOutline,
  logOutOutline,
  book,
  recycle,
  leaf,
} from "ionicons/icons";

const navigateTo = (route: string) => {
  // Implement your navigation logic here
};

const logout = () => {
  // Implement your logout logic here
};
</script>

<style scoped>
.recycled-bottles {
  background: linear-gradient(135deg, #65bc50, #4a9e38);
  color: white;
  text-align: center;
  padding: 20px 0;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.recycled-bottles span {
  font-weight: bold;
}

ion-list ion-item {
  --ion-item-background: white;
  --ion-item-color: #65bc50;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

ion-list ion-item:hover {
  transform: scale(1.02);
}

ion-toolbar {
  --background: linear-gradient(135deg, #65bc50, #4a9e38);
  --color: white;
}
</style>
