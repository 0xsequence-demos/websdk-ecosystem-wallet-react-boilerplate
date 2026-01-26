import { Chain } from "viem";
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
const getExplorerTxUrl = (chain: number | undefined, hash: string) => {
  if (chain === 421614) return `https://sepolia.arbiscan.io/tx/${hash}`;
  if (chain === 42161) return `https://arbiscan.io/tx/${hash}`;
  return `https://etherscan.io/tx/${hash}`;
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

    try {
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

      const hash = await writeContractAsync({
        address: mintContractAddress,
        abi: awardAbi,
        functionName: "awardItem",
        args: [account as `0x${string}`, demoTokenUri],
      });

      return { data: { hash, network }, persist: true };
    } catch (e) {
      const error = e as Error;
      return {
        data: {
          error: "Unsuccessful transaction",
          message: error.message,
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
      <Card className="flex flex-col gap-4">
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
            disabled={isPending || !mintChainOkForMint}
          >
            <span>{!isPending ? `Mint NFT` : `Minting...`}</span>
          </Button>
        </Form>
      </Card>

      {isTxnInvalid ? (
        <Card className="flex flex-col gap-4">
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
        <Card className="flex flex-col gap-4">
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
