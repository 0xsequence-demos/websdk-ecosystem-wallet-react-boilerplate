import { type ConnectConfig, createConfig } from "@0xsequence/connect";
import { chainIdFromString, chainIdsFromString } from "./utils/chainIdUtils";

const projectAccessKey =
  import.meta.env.VITE_SEQUENCE_PROJECT_ACCESS_KEY ||
  import.meta.env.VITE_PROJECT_ACCESS_KEY;
const walletUrl = import.meta.env.VITE_WALLET_APP_URL;
const chainIds = chainIdsFromString(import.meta.env.VITE_CHAINS);
const defaultChainId =
  chainIdFromString(import.meta.env.VITE_DEFAULT_CHAIN) ?? chainIds[0];

if (!walletUrl) {
  throw new Error(
    "Missing VITE_WALLET_APP_URL. Set it in your .env to your ecosystem wallet URL.",
  );
}

if (defaultChainId && !chainIds.includes(defaultChainId)) {
  console.warn(
    `Your preferred default chain ${defaultChainId} is not on your list of supported chains (${import.meta.env.VITE_DEFAULT_CHAIN})`,
  );
}

const baseConfig: ConnectConfig = {
  projectAccessKey,
  defaultTheme: "light",
  signIn: {
    projectName: "Kit Starter",
    descriptiveSocials: true,
    disableTooltipForDescriptiveSocials: true,
  },
};

export const config = createConfig({
  ...baseConfig,
  chainIds,
  defaultChainId,
  appName: "Kit Starter",
  walletUrl: "https://v3.sequence-dev.app",
  dappOrigin: window.location.origin,
  enableImplicitSession: true,
});
