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
      bannerAdUnitId: "ca-app-pub-3940256099942544/2934735716",
      requestTrackingAuthorization: true,
    },
  },
};

export default config;
