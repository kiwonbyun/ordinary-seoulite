import { describe, expect, it } from "vitest";
import { boardPostSchema } from "./board";

describe("boardPostSchema", () => {
  it("rejects empty title/body", () => {
    const result = boardPostSchema.safeParse({ title: "", body: "" });
    expect(result.success).toBe(false);
  });

  it("requires a post type", () => {
    const result = boardPostSchema.safeParse({
      title: "How can I use subway from Incheon airport?",
      body: "I will arrive at night and want to know the easiest route with luggage.",
      locationTag: "Incheon Airport",
    });
    expect(result.success).toBe(false);
  });

  it("accepts question/review/tip types", () => {
    const base = {
      title: "A practical Seoul trip note",
      body: "This is a long enough body for validation, with useful details for other travelers.",
      locationTag: "Jong-ro",
    };
    expect(boardPostSchema.safeParse({ ...base, type: "question" }).success).toBe(true);
    expect(boardPostSchema.safeParse({ ...base, type: "review" }).success).toBe(true);
    expect(boardPostSchema.safeParse({ ...base, type: "tip" }).success).toBe(true);
  });
});
