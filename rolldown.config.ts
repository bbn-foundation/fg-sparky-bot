import { defineConfig, type RolldownOptions } from "rolldown";

const config: RolldownOptions = defineConfig({
  input: "src/main.ts",
  output: {
    dir: "dist",
    cleanDir: true,
    banner: `/**
 * @license
 * fg-sparky-bot - Guess the FG number based on its symbol
 * Copyright (C) 2025 Skylafalls
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
`,
    format: "esm",
    minify: true,
    sourcemap: true,
  },
  tsconfig: "./tsconfig.json",
  platform: "node",
});

export default config;
