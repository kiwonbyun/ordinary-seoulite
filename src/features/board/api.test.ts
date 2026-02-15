import { describe, expect, it, vi } from "vitest";
import { fetchBoardPostById, fetchBoardPosts } from "./api";

describe("fetchBoardPosts", () => {
  it("maps supabase rows to board model", async () => {
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
    });
  });
});

describe("fetchBoardPostById", () => {
  it("loads single post", async () => {
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
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });

    const post = await fetchBoardPostById("1", { from } as never);

    expect(post.id).toBe("1");
    expect(post.title).toContain("Seoul");
  });
});
