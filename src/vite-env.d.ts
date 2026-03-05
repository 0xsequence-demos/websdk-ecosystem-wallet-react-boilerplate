/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECT_ACCESS_KEY: string;
  readonly VITE_SEQUENCE_PROJECT_ACCESS_KEY: string;
  readonly VITE_WALLET_APP_URL: string;
  readonly VITE_ENABLE_IMPLICIT_SESSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
