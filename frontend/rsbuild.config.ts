import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginNodePolyfill()
  ],
  source: {
    define:{
      "process.env.PUBLIC_GOOGLE_CLIENT_ID": JSON.stringify(process.env.PUBLIC_GOOGLE_CLIENT_ID),
      "process.env.PUBLIC_API_URL": JSON.stringify(process.env.PUBLIC_API_URL),
      "process.env.PUBLIC_WS_URL": JSON.stringify(process.env.PUBLIC_WS_URL),
      "process.env.PUBLIC_YOUTUBE_API_KEY": JSON.stringify(process.env.PUBLIC_YOUTUBE_API_KEY),
      "process.env.PUBLIC_TWITTER_BEARER_TOKEN": JSON.stringify(process.env.PUBLIC_TWITTER_BEARER_TOKEN),
      "process.env.PUBLIC_TIKTOK_RAPID_API_KEY": JSON.stringify(process.env.PUBLIC_TIKTOK_RAPID_API_KEY),
      "process.env.PUBLIC_TWITCH_CLIENT_ID": JSON.stringify(process.env.PUBLIC_TWITCH_CLIENT_ID),
      "process.env.PUBLIC_TWITCH_OAUTH_TOKEN": JSON.stringify(process.env.PUBLIC_TWITCH_OAUTH_TOKEN)
    },
    entry: {
      index: "./src/main.tsx"
    }
  },
  html: {
    template: "./index.html",
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://f199-2405-4802-c0fa-c940-f626-79ff-fedc-4bf.ngrok-free.app"
      },
    },
  },
  dev: {
    writeToDisk: true,
  }
});