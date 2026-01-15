import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const port = 4173;
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm dev --host ${host} --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_E2E: "true",
      VITE_PROJECT_ACCESS_KEY: "test_access_key",
      VITE_WALLET_APP_URL: baseURL,
      VITE_CHAINS: "1",
      VITE_DEFAULT_CHAIN: "1",
    },
  },
});
