import { describe, expect, it, vi } from "vitest";
import fallbackThumbnail from "@/app/assets/main.jpg";
import { fetchBoardPostById, fetchBoardPosts } from "./api";

describe("fetchBoardPosts", () => {
  it("maps supabase rows to board model with first image thumbnail", async () => {
    const chain = {
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [
          {
            id: "1",
            type: "question",
            title: "Where should I stay in Seoul?",
            body: "Looking for first-time friendly neighborhoods",
            location_tag: "Myeongdong",
            status: "open",
            created_at: "2026-02-15T00:00:00.000Z",
            author_id: "u1",
            users: [{ display_name: "Writer" }],
            board_post_images: [
              { id: "i2", image_url: "https://cdn/2.jpg", position: 1 },
              { id: "i1", image_url: "https://cdn/1.jpg", position: 0 },
            ],
          },
        ],
        error: null,
      }),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    const select = vi.fn().mockReturnValue(chain);
    const from = vi.fn().mockReturnValue({ select });

    const posts = await fetchBoardPosts({ offset: 0, limit: 20, filters: { search: "seo" } }, { from } as never);

    expect(chain.or).toHaveBeenCalled();
    expect(posts[0]).toMatchObject({
      id: "1",
      locationTag: "Myeongdong",
      status: "open",
      thumbnailUrl: "https://cdn/1.jpg",
      authorDisplayName: "Writer",
    });
  });

  it("falls back to main image when no board image exists", async () => {
    const chain = {
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [
          {
            id: "1",
            type: "question",
            title: "Where should I stay in Seoul?",
            body: "Looking for first-time friendly neighborhoods",
            location_tag: "Myeongdong",
            status: "open",
            created_at: "2026-02-15T00:00:00.000Z",
            author_id: "u1",
            users: [{ display_name: null }],
            board_post_images: [],
          },
        ],
        error: null,
      }),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };
    const select = vi.fn().mockReturnValue(chain);
    const from = vi.fn().mockReturnValue({ select });

    const posts = await fetchBoardPosts({ offset: 0, limit: 20 }, { from } as never);
    expect(posts[0].thumbnailUrl).toBe(fallbackThumbnail);
  });
});

describe("fetchBoardPostById", () => {
  it("loads single post with sorted image list", async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: "1",
        type: "question",
        title: "Where should I stay in Seoul?",
        body: "Looking for first-time friendly neighborhoods",
        location_tag: "Myeongdong",
        status: "open",
        created_at: "2026-02-15T00:00:00.000Z",
        author_id: "u1",
        users: [{ display_name: "Writer" }],
        board_post_images: [
          { id: "i2", image_url: "https://cdn/2.jpg", position: 2 },
          { id: "i1", image_url: "https://cdn/1.jpg", position: 0 },
        ],
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });

    const post = await fetchBoardPostById("1", { from } as never);

    expect(post.id).toBe("1");
    expect(post.images[0].imageUrl).toBe("https://cdn/1.jpg");
  });
});
