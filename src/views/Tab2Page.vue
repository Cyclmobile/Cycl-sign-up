<template>
  <ion-page>
    <ion-header>
      <ion-toolbar style="background-color: #65bc50">
        <ion-title style="color: #fff">Explore Great Discounts</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content style="background-color: #f0f0f0">
      <ion-list>
        <ion-item
          v-for="reward in rewards"
          :key="reward.id"
          style="
            position: relative;
            background-color: #fff;
            border-radius: 15px;
            margin: 10px;
            padding: 0;
            overflow: hidden;
          "
        >
          <img
            :src="reward.image"
            alt="reward image"
            style="width: 100%; height: 200px; object-fit: cover"
          />

          <div
            style="
              position: absolute;
              top: 10px;
              right: 10px;
              background-color: rgba(0, 0, 0, 0.5);
              color: #fff;
              padding: 5px 10px;
              border-radius: 5px;
              font-weight: bold;
            "
          >
            {{ reward.cost }} points
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
            <h2 style="color: #fff; margin: 0">{{ reward.title }}</h2>
            <p style="color: #fff; margin: 5px 0">{{ reward.about }}</p>
          </div>

          <div style="position: absolute; bottom: 10px; right: 10px">
            <ion-button
              style="--background: #31b46f; --border-radius: 20px"
              @click="activateCoupon(reward.cost)"
              >Activate Coupon</ion-button
            >
          </div>
        </ion-item>
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
} from "@ionic/vue";
import { defineComponent, ref } from "vue";

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
    const rewards = ref([
      {
        id: 1,
        image: "path/to/your/image1.jpg",
        title: "Reward Title 1",
        about: "Small description about reward 1",
        cost: 100,
      },
      // add more reward objects here
    ]);

    const activateCoupon = (cost: number) => {
      console.log(`Coupon activated for ${cost} points`);
    };

    return {
      rewards,
      activateCoupon,
    };
  },
});
</script>
