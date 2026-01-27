import { type ConnectConfig, createConfig } from "@0xsequence/connect";

const projectAccessKey =
  import.meta.env.VITE_SEQUENCE_PROJECT_ACCESS_KEY ||
  import.meta.env.VITE_PROJECT_ACCESS_KEY;
const walletUrl = import.meta.env.VITE_WALLET_APP_URL;

if (!walletUrl) {
  throw new Error(
    "Missing VITE_WALLET_APP_URL. Set it in your .env to your ecosystem wallet URL.",
  );
}

const baseConfig: ConnectConfig = {
  projectAccessKey,
  defaultTheme: "light",
  signIn: {
    projectName: "WebSDK Starter",
    descriptiveSocials: true,
    disableTooltipForDescriptiveSocials: true,
  },
};

export const config = createConfig({
  ...baseConfig,
  appName: "WebSDK Starter",
  walletUrl,
  dappOrigin: window.location.origin,
  enableImplicitSession: true,
});
