import { expect, test, type Page } from "@playwright/test";

type MockWalletStatus = "accepted" | "rejected";

const installMockWallet = async (page: Page, status: MockWalletStatus) => {
  await page.addInitScript(
    ({ status, walletAddress }) => {
      const MessageType = {
        WALLET_OPENED: "WALLET_OPENED",
        INIT: "INIT",
        REQUEST: "REQUEST",
        RESPONSE: "RESPONSE",
      };
      window.open = (url) => {
        const parsedUrl = new URL(
          typeof url === "string" ? url : (url?.toString?.() ?? ""),
          window.location.origin,
        );
        const walletOrigin = parsedUrl.origin;
        const sessionId = parsedUrl.searchParams.get("sessionId") || "session";
        const fakeWindow = {
          closed: false,
          close() {
            this.closed = true;
          },
          postMessage(message: unknown) {
            if (!message || typeof message !== "object") {
              return;
            }

            const payload = message as {
              type?: string;
              id?: string;
              action?: string;
            };

            if (payload.type === MessageType.REQUEST && payload.id) {
              if (status === "rejected") {
                window.dispatchEvent(
                  new MessageEvent("message", {
                    origin: walletOrigin,
                    data: {
                      id: payload.id,
                      type: MessageType.RESPONSE,
                      error: {
                        message: "User rejected the request.",
                      },
                    },
                  }),
                );
                return;
              }

              window.dispatchEvent(
                new MessageEvent("message", {
                  origin: walletOrigin,
                  data: {
                    id: payload.id,
                    type: MessageType.RESPONSE,
                    payload: {
                      walletAddress,
                      loginMethod: "ecosystem",
                    },
                  },
                }),
              );
            }
          },
        };

        setTimeout(() => {
          window.dispatchEvent(
            new MessageEvent("message", {
              origin: walletOrigin,
              data: {
                id: "wallet-opened",
                type: MessageType.WALLET_OPENED,
                sessionId,
              },
            }),
          );
        }, 0);

        return fakeWindow as unknown as Window;
      };
    },
    { status, walletAddress: "0x0000000000000000000000000000000000000001" },
  );
};

test("connects with ecosystem wallet", async ({ page }) => {
  await installMockWallet(page, "accepted");

  await page.goto("/");
  await page.getByRole("button", { name: "Connect" }).click();

  await expect(page.locator('[data-id="send-transaction"]')).toBeVisible();
});

test("stays disconnected when wallet rejects", async ({ page }) => {
  await installMockWallet(page, "rejected");

  await page.goto("/");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(page.getByRole("button", { name: "Connect" })).toBeVisible();
  await expect(page.locator('[data-id="send-transaction"]')).toHaveCount(0);
});
