import { describe, expect, it, vi } from "vitest";
import { fetchGalleryItems } from "./api";

describe("fetchGalleryItems", () => {
  it("maps gallery rows", async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [{ id: "g1", image_url: "https://img", caption: "sunset", location_tag: "Han River", created_at: "2026-02-15" }],
      error: null,
    });
    const order = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ order });
    const from = vi.fn().mockReturnValue({ select });

    const items = await fetchGalleryItems({ from } as never);
    expect(items[0].locationTag).toBe("Han River");
  });
});
