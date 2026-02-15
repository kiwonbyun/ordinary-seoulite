import { describe, expect, it } from "vitest";
import { formatBoardStatus } from "./utils";

describe("formatBoardStatus", () => {
  it("formats answered", () => {
    expect(formatBoardStatus("answered")).toBe("Answered");
  });

  it("formats open", () => {
    expect(formatBoardStatus("open")).toBe("Open");
  });
});

