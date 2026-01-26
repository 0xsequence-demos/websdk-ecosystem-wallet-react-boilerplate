import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./unit/setup.ts"],
    include: ["unit/**/*.test.ts", "unit/**/*.test.tsx"],
    css: true,
  },
});
