/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECT_ACCESS_KEY: string;
  readonly VITE_WALLET_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
