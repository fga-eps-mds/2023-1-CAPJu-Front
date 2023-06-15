import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // @ts-ignore
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    coverage: { reporter: ["lcov", "html"] },
    environment: "jsdom",
    reporters: process.env.VITEST_REPORTERS,
    outputFile: "coverage/coverage.xml",
  },
});
