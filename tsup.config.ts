import { defineConfig } from "tsup";

export default defineConfig({
  entryPoints: ["src/index.ts", "src/authentication/index.ts"],
  format: ["esm"],
  minify: true,
  outDir: "lib",
  clean: true
});
