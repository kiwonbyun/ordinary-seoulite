import { describe, expect, it, vi } from "vitest";
import { createGalleryItem, fetchGalleryItems } from "./api";

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

describe("createGalleryItem", () => {
  it("rejects non-admin users", async () => {
    const getCurrentUser = vi.fn().mockResolvedValue({
      id: "user-1",
      app_metadata: { role: "user" },
    });
    const uploadImage = vi.fn();
    const from = vi.fn();

    await expect(
      createGalleryItem(
        { imageFile: new File(["abc"], "a.jpg", { type: "image/jpeg" }) },
        { client: { from } as never, getCurrentUser, uploadImage },
      ),
    ).rejects.toThrow("Only admins can create gallery items.");

    expect(uploadImage).not.toHaveBeenCalled();
    expect(from).not.toHaveBeenCalled();
  });

  it("creates gallery item with uploaded image and author", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: "g1",
        image_url: "https://cdn.example.com/gallery/g1.webp",
        caption: "Han River dusk",
        location_tag: "Han River",
        created_at: "2026-02-18T00:00:00.000Z",
      },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    const from = vi.fn().mockReturnValue({ insert });
    const getCurrentUser = vi.fn().mockResolvedValue({
      id: "admin-1",
      app_metadata: { role: "admin" },
    });
    const uploadImage = vi.fn().mockResolvedValue("https://cdn.example.com/gallery/g1.webp");

    const created = await createGalleryItem(
      {
        imageFile: new File(["abc"], "a.jpg", { type: "image/jpeg" }),
        caption: "Han River dusk",
        locationTag: "Han River",
      },
      { client: { from } as never, getCurrentUser, uploadImage },
    );

    expect(uploadImage).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith({
      image_url: "https://cdn.example.com/gallery/g1.webp",
      caption: "Han River dusk",
      location_tag: "Han River",
      created_by: "admin-1",
    });
    expect(created.locationTag).toBe("Han River");
  });
});
