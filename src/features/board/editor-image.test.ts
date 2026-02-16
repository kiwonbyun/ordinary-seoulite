import { describe, expect, it } from "vitest";
import { extractImageUrlsFromHtml, validateEditorImageFile } from "./editor-image";

describe("validateEditorImageFile", () => {
  it("rejects unsupported file types", () => {
    const result = validateEditorImageFile(new File(["x"], "a.gif", { type: "image/gif" }));
    expect(result.success).toBe(false);
  });

  it("rejects files larger than 8MB", () => {
    const tooLarge = new File([new Uint8Array(8 * 1024 * 1024 + 1)], "big.jpg", { type: "image/jpeg" });
    const result = validateEditorImageFile(tooLarge);
    expect(result.success).toBe(false);
  });

  it("accepts valid image files", () => {
    const result = validateEditorImageFile(new File(["x"], "a.webp", { type: "image/webp" }));
    expect(result).toEqual({ success: true });
  });
});

describe("extractImageUrlsFromHtml", () => {
  it("extracts image src values from html", () => {
    const html = `
      <p>Hello</p>
      <img src="https://cdn.example.com/a.webp" />
      <p>World</p>
      <img alt="x" src='https://cdn.example.com/b.webp'>
    `;
    expect(extractImageUrlsFromHtml(html)).toEqual([
      "https://cdn.example.com/a.webp",
      "https://cdn.example.com/b.webp",
    ]);
  });

  it("deduplicates repeated image urls", () => {
    const html = '<img src="https://cdn.example.com/a.webp"><img src="https://cdn.example.com/a.webp">';
    expect(extractImageUrlsFromHtml(html)).toEqual(["https://cdn.example.com/a.webp"]);
  });
});

