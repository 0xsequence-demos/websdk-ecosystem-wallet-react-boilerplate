import type { ComponentPropsWithoutRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Connected } from "../../src/views/Connected";

type CardProps = ComponentPropsWithoutRef<"div"> & { collapsable?: boolean };
type GroupProps = ComponentPropsWithoutRef<"div">;

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
}));

vi.mock("@0xsequence-demos/boilerplate-design-system", () => ({
  Card: ({ children, collapsable, ...props }: CardProps) => {
    void collapsable;
    return <div {...props}>{children}</div>;
  },
  Group: ({ children, ...props }: GroupProps) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock("../../src/components/TestSignMessage", () => ({
  default: () => <div>Sign</div>,
}));
vi.mock("../../src/components/TestVerifyMessage", () => ({
  default: () => <div>Verify</div>,
}));
vi.mock("../../src/components/TestMintNFT", () => ({
  default: () => <div>Mint</div>,
}));

import { useAccount } from "wagmi";

const useAccountMock = vi.mocked(useAccount);

beforeEach(() => {
  useAccountMock.mockReset();
});

describe("Connected", () => {
  it("shows missing information when account data is incomplete", () => {
    useAccountMock.mockReturnValue({
      address: undefined,
      chain: undefined,
      chainId: undefined,
    });

    render(<Connected />);

    expect(screen.getByTestId("missing-info")).toBeInTheDocument();
  });

  it("renders action cards when connected", () => {
    useAccountMock.mockReturnValue({
      address: "0x0000000000000000000000000000000000000001",
      chain: { id: 1, name: "Mainnet" },
      chainId: 1,
    });

    render(<Connected />);

    expect(screen.getByTestId("sign-message-card")).toBeInTheDocument();
    expect(screen.getByTestId("verify-message-card")).toBeInTheDocument();
    expect(screen.getByTestId("mint-nft-card")).toBeInTheDocument();
  });
});
