import { beforeEach, describe, expect, it, vi } from "vitest";
import * as boardPosts from "@/lib/board-posts";
import { GET } from "./route";

describe("board posts api route", () => {
  const fetchBoardPostsPage = vi.spyOn(boardPosts, "fetchBoardPostsPage");

  beforeEach(() => {
    fetchBoardPostsPage.mockReset();
  });

  it("returns paginated board posts from offset", async () => {
    fetchBoardPostsPage.mockResolvedValue({
      posts: [
        {
          id: "post-1",
          title: "First",
          body: "Body",
          locationTag: "Jong-ro",
          status: "open",
        },
      ],
      hasMore: true,
      nextOffset: 21,
    });

    const req = new Request("http://localhost:3000/api/board/posts?offset=20");
    const response = await GET(req);

    expect(fetchBoardPostsPage).toHaveBeenCalledWith({ offset: 20, limit: 20 });
    await expect(response.json()).resolves.toEqual({
      posts: [
        {
          id: "post-1",
          title: "First",
          body: "Body",
          locationTag: "Jong-ro",
          status: "open",
        },
      ],
      hasMore: true,
      nextOffset: 21,
    });
  });

  it("falls back to offset 0 for invalid offset", async () => {
    fetchBoardPostsPage.mockResolvedValue({ posts: [], hasMore: false, nextOffset: 0 });

    const req = new Request("http://localhost:3000/api/board/posts?offset=-1");
    await GET(req);

    expect(fetchBoardPostsPage).toHaveBeenCalledWith({ offset: 0, limit: 20 });
  });
});
