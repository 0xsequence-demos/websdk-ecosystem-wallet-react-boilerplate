# Sequence WebSDK Ecosystem Wallet React Starter Boilerplate

Starter Sequence Ecosystem Wallet boilerplate that uses [Sequence WebSDK](https://github.com/0xsequence/web-sdk) with React.

## Quickstart

Copy `.env.example` to `.env` and fill with your project information. To test things out, you can use the pre-provided keys in the `.env.example` file:

```
cp .env.example .env
```

Then install and run:

```js
pnpm install && pnpm dev
```

The app will start on `localhost:4444`

To provide your own keys from [Sequence Builder](https://sequence.build/), simply edit the `.env` file accordingly. You'll also need the URL for your Ecosystem Wallet.

Recommended env vars:

```env
VITE_SEQUENCE_PROJECT_ACCESS_KEY=...
VITE_WALLET_APP_URL=...
VITE_ENABLE_IMPLICIT_SESSION=false
```

For hosted deployments (for example Cloudflare), make sure these vars are also configured in your deployment environment and that the deployed origin is allowed in Sequence Builder.

## Testing

Unit tests (Vitest):

```js
pnpm test:unit
```

End-to-end tests (Playwright):

```js
pnpm test:e2e
```

Run everything:

```js
pnpm test:all
```

Notes:
- Playwright starts the dev server on `127.0.0.1:4173` with `VITE_E2E=true` and test env vars from `playwright.config.ts`.
- If you are running in a restricted environment, you may need to allow the test runner to bind to that port.
