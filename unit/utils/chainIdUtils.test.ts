import { describe, expect, it, vi } from "vitest";
import { networks } from "@0xsequence/network";
import {
  chainIdFromString,
  chainIdsFromString,
} from "../../src/utils/chainIdUtils";

describe("chainIdFromString", () => {
  const [firstKey] = Object.keys(networks);
  const firstName = networks[firstKey]?.name ?? "";

  it("parses network keys and names", () => {
    expect(chainIdFromString(firstKey)).toBe(Number(firstKey));
    expect(chainIdFromString(firstName)).toBe(Number(firstKey));
  });

  it("warns and returns undefined for unknown identifiers", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(chainIdFromString("not-a-chain")).toBeUndefined();
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });
});

describe("chainIdsFromString", () => {
  const [firstKey] = Object.keys(networks);

  it("dedupes and trims input", () => {
    const result = chainIdsFromString(` ${firstKey}, ${firstKey} `);
    expect(result).toEqual([Number(firstKey)]);
  });
});
