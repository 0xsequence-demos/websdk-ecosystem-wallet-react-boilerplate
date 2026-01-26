import {
  SequenceConnect,
  type ExtendedConnector,
  useOpenConnectModal,
} from "@0xsequence/connect";
import { config } from "./config";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { Connected } from "./views/Connected";
import {
  Button,
  SequenceBoilerplate,
} from "@0xsequence-demos/boilerplate-design-system";

export default function Layout() {
  return (
    <SequenceConnect config={config}>
      <App />
    </SequenceConnect>
  );
}

function App() {
  const { isConnected } = useAccount();
  const { setOpenConnectModal } = useOpenConnectModal();
  const { connectAsync, connectors } = useConnect();
  const [isConnecting, setIsConnecting] = useState(false);
  const isE2E = import.meta.env.VITE_E2E === "true";
  const ecosystemConnector = (connectors as ExtendedConnector[]).find(
    (connector) => connector._wallet?.isEcosystemWallet,
  );

  const handleConnect = async () => {
    if (!isE2E) {
      setOpenConnectModal(true);
      return;
    }

    if (!ecosystemConnector) {
      console.warn("No ecosystem wallet connector found.");
      return;
    }

    setIsConnecting(true);
    try {
      await connectAsync({ connector: ecosystemConnector });
    } catch (err) {
      console.error("Ecosystem wallet connect failed", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const buttonLabel = isE2E && isConnecting ? "Connecting..." : "Connect";
  const isButtonDisabled = isE2E && isConnecting;

  return (
    <SequenceBoilerplate
      githubUrl="https://github.com/0xsequence-demos/websdk-ecosystem-wallet-react-boilerplate"
      name="Sequence Web SDK Starter - React"
      description="Ecosystem Wallet"
      wagmi={{ useAccount, useDisconnect, useSwitchChain }}
    >
      {isConnected ? (
        <Connected />
      ) : (
        <div className="flex flex-col items-center w-full">
          <Button
            variant="primary"
            subvariants={{ padding: "comfortable" }}
            onClick={handleConnect}
            disabled={isButtonDisabled}
            data-testid="connect-button"
          >
            {buttonLabel}
          </Button>
        </div>
      )}
    </SequenceBoilerplate>
  );
}
