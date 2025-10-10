import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.crewvar.app",
  appName: "Crewvar",
  webDir: "dist",
  server: {
    url: "https://crewvar.com",
    cleartext: false,
  },
};

export default config;
