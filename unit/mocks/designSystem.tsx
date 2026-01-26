import type React from "react";
import { vi } from "vitest";

export const useStoreDataMock = vi.fn();
export const setStoreDataMock = vi.fn();
export const updateFieldsMock = vi.fn();

export const designSystemMock = {
  Form: ({
    children,
    onAction,
    ...props
  }: React.ComponentProps<"form"> & { onAction?: React.FormEventHandler }) => (
    <form onSubmit={onAction} {...props}>
      {children}
    </form>
  ),
  Button: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button {...props}>{children}</button>
  ),
  InputText: (props: React.ComponentProps<"input">) => <input {...props} />,
  Input: (props: React.ComponentProps<"input">) => <input {...props} />,
  Field: ({ children, ...props }: React.ComponentProps<"div">) => (
    <div {...props}>{children}</div>
  ),
  Label: ({ children, ...props }: React.ComponentProps<"label">) => (
    <label {...props}>{children}</label>
  ),
  Card: ({ children, ...props }: React.ComponentProps<"div">) => (
    <div {...props}>{children}</div>
  ),
  Group: ({ children, ...props }: React.ComponentProps<"div">) => (
    <div {...props}>{children}</div>
  ),
  FormErrors: ({ children, ...props }: React.ComponentProps<"div">) => (
    <div {...props}>{children}</div>
  ),
  FieldError: ({ children, ...props }: React.ComponentProps<"div">) => (
    <div {...props}>{children}</div>
  ),
  Svg: ({ name, ...props }: { name?: string; className?: string }) => (
    <span data-name={name} {...props} />
  ),
  useStoreData: useStoreDataMock,
  setStoreData: setStoreDataMock,
  useForm: () => ({ updateFields: updateFieldsMock }),
};

export default designSystemMock;
