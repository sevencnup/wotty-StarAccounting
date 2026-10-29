import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wotty.stark.web',
  appName: 'Wotty Stark Web',
  webDir: 'out',
  server: {
    androidScheme: 'http',
  },
};

export default config;
