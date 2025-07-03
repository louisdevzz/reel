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
        target: "http://localhost:3001"
      },
    },
  },
  dev: {
    writeToDisk: true,
  }
});