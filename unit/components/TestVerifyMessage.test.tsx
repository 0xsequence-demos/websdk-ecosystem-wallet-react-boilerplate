import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TestVerifyMessage from "../../src/components/TestVerifyMessage";

vi.mock("wagmi", () => ({
  usePublicClient: vi.fn(),
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
  Field: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Input: (props: any) => <input {...props} />,
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  Card: ({ children, collapsable, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  FormErrors: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  FieldError: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  Svg: ({ name, ...props }: any) => <span data-name={name} {...props} />,
  useStoreData: vi.fn(),
  setStoreData: vi.fn(),
  useForm: vi.fn(),
}));

import { usePublicClient } from "wagmi";
import {
  useForm,
  useStoreData,
} from "@0xsequence-demos/boilerplate-design-system";

const usePublicClientMock = vi.mocked(usePublicClient);
const useStoreDataMock = vi.mocked(useStoreData);
const useFormMock = vi.mocked(useForm);

beforeEach(() => {
  usePublicClientMock.mockReset();
  useStoreDataMock.mockReset();
  useFormMock.mockReset();

  usePublicClientMock.mockReturnValue({
    verifyMessage: vi.fn(),
  });
  useFormMock.mockReturnValue({ updateFields: vi.fn() });
});

describe("TestVerifyMessage", () => {
  it("renders the verification form when idle", () => {
    useStoreDataMock.mockReturnValue("idle");

    render(<TestVerifyMessage chainId={1} />);

    expect(screen.getByTestId("verify-message-form")).toBeInTheDocument();
  });

  it("renders the valid state summary", () => {
    useStoreDataMock.mockReturnValue("valid");

    render(<TestVerifyMessage chainId={1} />);

    expect(screen.getByTestId("verify-message-result")).toBeInTheDocument();
    expect(screen.getByText(/Signature is valid/i)).toBeInTheDocument();
  });
});
