import { createContractPermission, useExplicitSessions } from "@0xsequence/connect";
import { Chain, parseEther } from "viem";
import { useWalletClient, useWriteContract } from "wagmi";
import chains from "../constants";
import {
  Button,
  Card,
  Form,
  FormHandler,
  useStoreData,
} from "@0xsequence-demos/boilerplate-design-system";

const mintContractAddress =
  "0x0d402C63cAe0200F0723B3e6fa0914627a48462E" as const;
const awardAbi = [
  {
    inputs: [
      { internalType: "address", name: "player", type: "address" },
      { internalType: "string", name: "tokenURI", type: "string" },
    ],
    name: "awardItem",
    outputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
const demoTokenUri =
  "https://dev-metadata.sequence.app/projects/277/collections/62/tokens/0.json";
const SIGNER_NOT_SUPPORTED_ERROR = "No signer supported for call";
const CHAIN_MANAGER_INIT_ERROR = "ChainSessionManager for chain";
const NO_SESSION_ERROR = "No sessions are available for the requested action";
const MISSING_PERMISSION_ERROR = "Missing permission for transaction";
const REQUEST_ABORTED_ERROR = "Request aborted";
const mintPermission = createContractPermission({
  address: mintContractAddress,
  functionSignature: "function awardItem(address player, string tokenURI)",
});
const mintSessionParams = {
  nativeTokenSpending: {
    valueLimit: parseEther("0.01"),
  },
  expiresIn: {
    hours: 24,
  },
  permissions: [mintPermission],
};

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isSessionError = (message: string) =>
  message.includes(CHAIN_MANAGER_INIT_ERROR) ||
  message.includes(NO_SESSION_ERROR) ||
  message.includes(MISSING_PERMISSION_ERROR) ||
  message.includes(SIGNER_NOT_SUPPORTED_ERROR);

const isRequestAbortedError = (error: Error) =>
  error.message.includes(REQUEST_ABORTED_ERROR) ||
  error.name === "AbortError";

const collectErrorMessages = (error: unknown): string[] => {
  const queue: unknown[] = [error];
  const seen = new Set<unknown>();
  const messages: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || seen.has(current)) {
      continue;
    }
    seen.add(current);

    if (typeof current === "string") {
      messages.push(current);
      continue;
    }

    if (typeof current === "object") {
      const candidate = current as Record<string, unknown>;
      const keys = ["message", "shortMessage", "details", "name"] as const;
      for (const key of keys) {
        const value = candidate[key];
        if (typeof value === "string" && value.trim().length > 0) {
          messages.push(value);
        }
      }
      if (candidate.cause) {
        queue.push(candidate.cause);
      }
      if (candidate.error) {
        queue.push(candidate.error);
      }
    }
  }

  return [...new Set(messages)];
};

const getExplorerTxUrl = (chain: number | undefined, hash: string) => {
  if (chain === 421614) return `https://sepolia.arbiscan.io/tx/${hash}`;
  if (chain === 42161) return `https://arbiscan.io/tx/${hash}`;
  return `https://etherscan.io/tx/${hash}`;
};

const isLocalOrigin = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
};

interface TxnRespose {
  hash: string | null;
  network?: Chain;
  error?: string;
  message?: string;
}

const TestMintNFT = (props: { chainId: number }) => {
  const { data: walletClient } = useWalletClient();
  const { chainId } = props;
  const { writeContractAsync, isPending } = useWriteContract();
  const { addExplicitSession, getExplicitSessions, isLoading: isSessionLoading } =
    useExplicitSessions();

  // Get chain information using chainId
  const network = chains.find((chain) => chain.id === chainId);
  const mintChainOkForMint = chainId === 42161 || chainId === 421614;

  const handleMintNft: FormHandler = async () => {
    if (!walletClient) {
      return {
        data: {
          error: "Connect a wallet to mint.",
          message: "No wallet client found.",
          hash: null,
          network,
        },
        persist: true,
      };
    }

    if (!mintChainOkForMint) {
      return {
        data: {
          error: "Unsupported chain.",
          message: "Switch to Arbitrum One or Arbitrum Sepolia to mint.",
          hash: null,
          network,
        },
        persist: true,
      };
    }

    const walletChainId = walletClient.chain?.id;
    if (walletChainId && walletChainId !== chainId) {
      return {
        data: {
          error: "Wallet network is still switching.",
          message: `Wallet client is on chain ${walletChainId}, but account is on chain ${chainId}. Wait a second and try minting again.`,
          hash: null,
          network,
        },
        persist: true,
      };
    }

    const ensureChainSession = async (force = false) => {
      const explicitSessions = await getExplicitSessions();
      const hasChainSession = explicitSessions.some(
        (session) => session.chainId === chainId,
      );
      if (!hasChainSession || force) {
        await addExplicitSession({
          chainId,
          ...mintSessionParams,
        });
      }
    };

    const sendMintTx = async (account: `0x${string}`) =>
      writeContractAsync({
        address: mintContractAddress,
        abi: awardAbi,
        functionName: "awardItem",
        args: [account, demoTokenUri],
        chainId,
      });

    try {
      await ensureChainSession();

      const [account] = await walletClient.getAddresses();
      if (!account) {
        return {
          data: {
            error: "No wallet address available.",
            message: "Connect a wallet with an address to mint.",
            hash: null,
            network,
          },
          persist: true,
        };
      }

      let hash: `0x${string}`;
      try {
        hash = await sendMintTx(account as `0x${string}`);
      } catch (firstError) {
        const first = firstError as Error;
        if (isRequestAbortedError(first)) {
          await pause(500);
          await ensureChainSession(true);
          await pause(750);

          try {
            hash = await sendMintTx(account as `0x${string}`);
          } catch (secondError) {
            const second = secondError as Error;
            if (isRequestAbortedError(second)) {
              await pause(1000);
              hash = await sendMintTx(account as `0x${string}`);
            } else {
              throw second;
            }
          }
        } else if (isSessionError(first.message)) {
          await ensureChainSession(true);
          hash = await sendMintTx(account as `0x${string}`);
        } else {
          throw first;
        }
      }

      return { data: { hash, network }, persist: true };
    } catch (e) {
      const error = e as Error;
      const rawErrorDetails = collectErrorMessages(e)
        .filter((msg) => msg !== "Error")
        .join(" | ");
      const txErrorMessage =
        error.message.includes(CHAIN_MANAGER_INIT_ERROR) ||
        error.message.includes(NO_SESSION_ERROR)
          ? "No active signing session is available on this chain. Disconnect and reconnect the wallet so the explicit mint session can be created."
          : error.message.includes(MISSING_PERMISSION_ERROR)
            ? "Session permissions for this chain are missing or expired. Disconnect and reconnect to approve mint permissions again."
          : error.message.includes(SIGNER_NOT_SUPPORTED_ERROR)
            ? "No signer is available for this contract call. Reconnect and approve the mint session. If this persists in deployment, verify env vars (project access key + wallet URL) and allowed origins in Sequence Builder."
            : error.message.includes(REQUEST_ABORTED_ERROR)
              ? `The request was aborted before the relayer responded. Retry after a short wait.${isLocalOrigin() ? ` Localhost hint: ensure ${window.location.origin} is allowed in Sequence Builder (project access key + wallet allowed origins), and that local env uses the same key/wallet URL as deployment.` : ""} Details: ${rawErrorDetails}`
            : error.message;
      return {
        data: {
          error: "Unsuccessful transaction",
          message: txErrorMessage,
          hash: null,
          network,
        },
        persist: true,
      };
    }
  };

  const values = useStoreData<TxnRespose>("mintNft") || { hash: null };

  const txHash = typeof values?.hash === "string" ? values.hash : "";
  const isTxnValid = typeof values?.hash === "string";
  const isTxnInvalid = values?.hash === null && !!values?.error;

  return (
    <>
      <Card className="flex flex-col gap-4" data-testid="mint-nft-card">
        <div>
          <span className="text-17">
            Mint NFT on {network?.name ?? "Unknown network"}
          </span>
          <p className="text-14 text-grey-100">
            Call awardItem on the demo contract to mint to your wallet
          </p>
          {!mintChainOkForMint && (
            <p className="text-12 text-orange-300 mt-2">
              Contract only available on Arbitrum One &amp; Arbitrum Sepolia.
              Switch chain to test.
            </p>
          )}
        </div>

        <Form name="mintNft" onAction={handleMintNft}>
          <Button
            type="submit"
            variant="primary"
            subvariants={{ padding: "comfortable" }}
            className="self-start disabled:opacity-50 contents-layered"
            disabled={isPending || isSessionLoading || !mintChainOkForMint}
          >
            <span>
              {isSessionLoading
                ? "Preparing session..."
                : isPending
                  ? "Minting..."
                  : "Mint NFT"}
            </span>
          </Button>
        </Form>
      </Card>

      {isTxnInvalid ? (
        <Card className="flex flex-col gap-4" data-testid="mint-nft-error">
          <dl className="flex flex-col gap-4">
            <div className="flex flex-col">
              <dt className="text-14 text-grey-100">
                Last mint ({values.network?.name ?? "Unknown network"})
              </dt>
              <dd className="w-full break-words font-mono text-13 ">
                Error: {values.error}
                <p className="mt-4 text-12">{values.message}</p>
              </dd>
            </div>
          </dl>
        </Card>
      ) : null}

      {isTxnValid ? (
        <Card className="flex flex-col gap-4" data-testid="mint-nft-success">
          <dl className="flex flex-col gap-4">
            <div className="flex flex-col">
              <dt className="text-14 text-grey-100">
                Last mint ({values.network?.name ?? "Unknown network"})
              </dt>
              <dd className="w-full break-words font-mono text-13 ">
                Hash: {txHash}
              </dd>
            </div>
          </dl>
          <a
            target="_blank"
            href={getExplorerTxUrl(values.network?.id ?? chainId, txHash)}
            rel="noreferrer noopener"
            className="underline text-14"
          >
            View on explorer
          </a>
        </Card>
      ) : null}
    </>
  );
};

export default TestMintNFT;
