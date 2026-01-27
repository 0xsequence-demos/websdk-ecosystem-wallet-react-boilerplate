import type { ComponentPropsWithoutRef, FormEventHandler } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TestSignMessage from "../../src/components/TestSignMessage";

type FormProps = ComponentPropsWithoutRef<"form"> & {
  onAction?: FormEventHandler<HTMLFormElement>;
};
type ButtonProps = ComponentPropsWithoutRef<"button">;
type InputProps = ComponentPropsWithoutRef<"input">;
type CardProps = ComponentPropsWithoutRef<"div"> & { collapsable?: boolean };

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useSignMessage: vi.fn(),
}));

vi.mock("@0xsequence-demos/boilerplate-design-system", () => ({
  Form: ({ children, onAction, ...props }: FormProps) => (
    <form onSubmit={onAction} {...props}>
      {children}
    </form>
  ),
  Button: ({ children, ...props }: ButtonProps) => (
    <button {...props}>{children}</button>
  ),
  InputText: (props: InputProps) => <input {...props} />,
  Card: ({ children, collapsable, ...props }: CardProps) => {
    void collapsable;
    return <div {...props}>{children}</div>;
  },
  useStoreData: vi.fn(),
  setStoreData: vi.fn(),
  useForm: vi.fn(),
}));

import { useAccount, useSignMessage } from "wagmi";
import {
  useForm,
  useStoreData,
} from "@0xsequence-demos/boilerplate-design-system";

const useAccountMock = vi.mocked(useAccount);
const useSignMessageMock = vi.mocked(useSignMessage);
const useStoreDataMock = vi.mocked(useStoreData);
const useFormMock = vi.mocked(useForm);

beforeEach(() => {
  useAccountMock.mockReset();
  useSignMessageMock.mockReset();
  useStoreDataMock.mockReset();
  useFormMock.mockReset();

  useAccountMock.mockReturnValue({
    address: "0x0000000000000000000000000000000000000001",
  });
  useSignMessageMock.mockReturnValue({
    isPending: false,
    signMessageAsync: vi.fn(),
  });
  useFormMock.mockReturnValue({ updateFields: vi.fn() });
});

describe("TestSignMessage", () => {
  it("renders the sign form when no signature is stored", () => {
    useStoreDataMock.mockReturnValue({ signature: null, message: null });

    render(<TestSignMessage />);

    expect(screen.getByTestId("sign-message-form")).toBeInTheDocument();
  });

  it("shows the signature summary when a signature exists", () => {
    useStoreDataMock.mockReturnValue({
      signature: "0xsignature",
      message: "hello",
    });

    render(<TestSignMessage />);

    expect(screen.getByTestId("sign-message-summary")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Verify message" }),
    ).toBeInTheDocument();
  });
});
