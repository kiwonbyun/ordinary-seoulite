import { describe, expect, it } from "vitest";
import { formatBoardStatus } from "./board";

describe("formatBoardStatus", () => {
  it("maps open to Open", () => {
    expect(formatBoardStatus("open")).toBe("Open");
  });
});
