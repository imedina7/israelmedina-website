import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), "UI")

  return {
    plugins: [],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      target: "es2020",
      sourcemap: false
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    }
  }
});