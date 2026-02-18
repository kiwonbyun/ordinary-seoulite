import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BoardRoute } from "./board";
import { useBoardPosts } from "@/features/board/hooks";

vi.mock("@/features/board/hooks", () => ({
  useBoardPosts: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, params, children, ...props }: any) => {
    const href =
      typeof to === "string" && params?.postId ? to.replace("$postId", params.postId as string) : String(to);
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

const mockedUseBoardPosts = vi.mocked(useBoardPosts);

describe("BoardRoute card link", () => {
  beforeEach(() => {
    mockedUseBoardPosts.mockReturnValue(
      {
        data: [
          {
            id: "post-1",
            type: "question",
            title: "Where should I stay in Seoul?",
            body: "Need recommendations near subway lines.",
            locationTag: "Seoul",
            status: "open",
            createdAt: "2026-02-18T00:00:00.000Z",
            authorId: "author-1",
            authorDisplayName: "Travel Editor",
            thumbnailUrl: "https://cdn.example.com/thumb.jpg",
            images: [],
          },
        ],
        isLoading: false,
        error: null,
      } as unknown as ReturnType<typeof useBoardPosts>,
    );
  });

  it("makes the entire post card a single detail link with stronger hover border", () => {
    render(<BoardRoute />);

    const postLink = screen.getByRole("link", { name: /Where should I stay in Seoul\?/i });
    expect(postLink).toHaveAttribute("href", "/board/post-1");
    expect(postLink).toHaveClass("hover:border-foreground/70");

    const authorText = screen.getByText("By Travel Editor");
    expect(authorText.closest("a")).toBe(postLink);
  });
});
