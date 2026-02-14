import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", undefined, "b")).toBe("a b");
  });

  it("deduplicates conflicting classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
