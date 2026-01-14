import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.mts",
  format: ["cjs", "es"],
  platform: "node",
  minify: true,
  dts: true,
  tsconfig: true,
  outDir: "./dist",
  fixedExtension: true,
});
