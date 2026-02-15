import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BoardFeedClient from "./BoardFeedClient";

describe("BoardFeedClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows empty state when no posts", () => {
    render(<BoardFeedClient initialPosts={[]} initialHasMore={false} initialOffset={0} />);

    expect(screen.getByText(/your story can be the first one/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
  });

  it("loads more posts and appends them", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          posts: [
            {
              id: "post-2",
              title: "Second post",
              body: "Body",
              locationTag: "Mapo",
              status: "open",
            },
          ],
          hasMore: false,
          nextOffset: 2,
        }),
        { status: 200 },
      ),
    );

    render(
      <BoardFeedClient
        initialPosts={[
          { id: "post-1", title: "First post", body: "Body", locationTag: "Jong-ro", status: "open" },
        ]}
        initialHasMore={true}
        initialOffset={1}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /load more/i }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Second post" })).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/board/posts?offset=1", { cache: "no-store" });
    expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument();
  });
});
