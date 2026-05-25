import { defineConfig } from "rolldown";

export default defineConfig({
  experimental: {
    lazyBarrel: true,
    nativeMagicString: true,
  },
  platform: "node",
  input: "./src/main.ts",
  output: {
    minify: true,
  }
})
