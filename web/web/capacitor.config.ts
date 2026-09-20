import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAP_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: "com.wotty.star_accounting",
  appName: "wotty",
  webDir: "out",
  android: {
    allowMixedContent: true,
  },
  server: {
    androidScheme: "http",
    ...(serverUrl
      ? {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
          allowNavigation: [new URL(serverUrl).host],
        }
      : {}),
  },
};

export default config;
