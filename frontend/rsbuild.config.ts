import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginNodePolyfill()
  ],
  source: {
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