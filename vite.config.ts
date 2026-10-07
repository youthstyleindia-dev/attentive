import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        sidepanel: resolve(__dirname, "sidepanel.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        options: resolve(__dirname, "options.html"),
      },
    },
  },
});
