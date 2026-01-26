import { vi } from "vitest";

export const useAccountMock = vi.fn();
export const useSignMessageMock = vi.fn();
export const usePublicClientMock = vi.fn();
export const useWalletClientMock = vi.fn();
export const useWriteContractMock = vi.fn();

export const wagmiMock = {
  useAccount: useAccountMock,
  useSignMessage: useSignMessageMock,
  usePublicClient: usePublicClientMock,
  useWalletClient: useWalletClientMock,
  useWriteContract: useWriteContractMock,
};

export default wagmiMock;
