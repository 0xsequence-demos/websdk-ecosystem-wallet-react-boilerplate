import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TestMintNFT from "../../src/components/TestMintNFT";

vi.mock("wagmi", () => ({
  useWalletClient: vi.fn(),
  useWriteContract: vi.fn(),
}));

vi.mock("@0xsequence-demos/boilerplate-design-system", () => ({
  Form: ({ children, onAction, ...props }: any) => (
    <form onSubmit={onAction} {...props}>
      {children}
    </form>
  ),
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  Card: ({ children, collapsable, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  useStoreData: vi.fn(),
}));

import { useWalletClient, useWriteContract } from "wagmi";
import { useStoreData } from "@0xsequence-demos/boilerplate-design-system";

const useWalletClientMock = vi.mocked(useWalletClient);
const useWriteContractMock = vi.mocked(useWriteContract);
const useStoreDataMock = vi.mocked(useStoreData);

beforeEach(() => {
  useWalletClientMock.mockReset();
  useWriteContractMock.mockReset();
  useStoreDataMock.mockReset();

  useWalletClientMock.mockReturnValue({ data: null });
  useWriteContractMock.mockReturnValue({
    writeContractAsync: vi.fn(),
    isPending: false,
  });
});

describe("TestMintNFT", () => {
  it("shows unsupported chain messaging on non-Arbitrum chains", () => {
    useStoreDataMock.mockReturnValue(undefined);

    render(<TestMintNFT chainId={1} />);

    expect(screen.getByTestId("mint-nft-card")).toBeInTheDocument();
    expect(
      screen.getByText(/Contract only available on Arbitrum One/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mint NFT/i })).toBeDisabled();
  });

  it("enables minting on Arbitrum chains", () => {
    useStoreDataMock.mockReturnValue(undefined);

    render(<TestMintNFT chainId={42161} />);

    expect(
      screen.queryByText(/Contract only available on Arbitrum One/i),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: /Mint NFT/i }),
    ).not.toBeDisabled();
  });
});
