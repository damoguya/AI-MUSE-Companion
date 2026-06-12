import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aimuse.companion',
  appName: 'AI-MUSE-Companion',
  webDir: 'dist',
  server: {
    // 热更新核心：APK 直接加载远程 H5，更新 H5 即等于更新 APP
    url: 'https://chat-pai-companion-329708958937.asia-south1.run.app',
    cleartext: true,
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
