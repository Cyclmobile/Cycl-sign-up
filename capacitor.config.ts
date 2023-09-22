import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "Cycl",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    AdMob: {
      adSize: "BANNER",
      testDevices: [],
      bannerAdUnitId: "ca-app-pub-8255021700561730/2737351779",
      requestTrackingAuthorization: true,
    },
  },
};

export default config;
