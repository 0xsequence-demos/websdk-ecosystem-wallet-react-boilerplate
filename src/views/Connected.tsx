import { useAccount } from "wagmi";

import TestSignMessage from "../components/TestSignMessage";
import TestVerifyMessage from "../components/TestVerifyMessage";
import TestMintNFT from "../components/TestMintNFT";

import { Group, Card } from "@0xsequence-demos/boilerplate-design-system";

export function Connected() {
  const { address, chain, chainId } = useAccount();

  if (!address || !chain || !chainId) {
    return (
      <div className="flex flex-col gap-8">
        <Group title="User info">
          <Card
            style={{ gap: "1rem", display: "flex", flexDirection: "column" }}
            data-testid="missing-info"
          >
            Missing information (
            {[
              !address ? "address" : null,
              !chain ? "chain" : null,
              !chainId ? "chainId" : null,
            ]
              .filter((n) => !!n)
              .join(", ")}
            ) required to display user info
          </Card>
        </Group>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Group>
        <Card
          collapsable
          title="Sign message"
          data-id="sign-message"
          data-testid="sign-message-card"
          className="bg-white/10 border border-white/10 backdrop-blur-sm"
        >
          <TestSignMessage />
        </Card>

        <Card
          collapsable
          title="Verify message"
          data-id="verify-message"
          data-testid="verify-message-card"
          className="bg-white/10 border border-white/10 backdrop-blur-sm"
        >
          <TestVerifyMessage chainId={chainId} />
        </Card>

        <Card
          collapsable
          title="Mint NFT"
          data-id="send-transaction"
          data-testid="mint-nft-card"
          className="bg-white/10 border border-white/10 backdrop-blur-sm"
        >
          <TestMintNFT chainId={chainId} />
        </Card>
      </Group>
    </div>
  );
}
