// vite.config.js
import { resolve } from "path";
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/crosswords.js"),
      name: "crosswords",
      // the proper extensions will be added
      fileName: "crosswords",
    },
    rollupOptions: {
      output: {
        // https://rollupjs.org/configuration-options/#output-assetfilenames
        // https://github.com/vitejs/vite/issues/4863#issuecomment-1005451468
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "crosswords.css";
          return assetInfo.name;
        },
      },
    },
  },
});
