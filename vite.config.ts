import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    publicDir: "public",
    plugins: [react(), tsconfigPaths()],
    server: {
      host: true,
      port: 3000,
    },
    resolve: {
      alias: {
        src: "/src",
      },
    },
  });
};
