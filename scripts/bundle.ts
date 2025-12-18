import { comptime } from "comptime.ts/bun";

await Bun.build({
  entrypoints: ["src/main.ts"],
  outdir: "dist",
  minify: true,
  sourcemap: "linked",
  target: "bun",
  plugins: [comptime()],
});
