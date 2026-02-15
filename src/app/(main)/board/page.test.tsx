import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchBoardPostsPage } = vi.hoisted(() => ({
  fetchBoardPostsPage: vi.fn(),
}));

vi.mock("@/lib/board-posts", () => ({
  BOARD_PAGE_SIZE: 20,
  fetchBoardPostsPage,
}));

import Page from "./page";

async function renderPage(searchParams?: { created?: string }) {
  const ui = await Page({
    searchParams: Promise.resolve(searchParams ?? {}),
  });
  return render(ui);
}

describe("Board page", () => {
  beforeEach(() => {
    fetchBoardPostsPage.mockResolvedValue({
      posts: [],
      hasMore: false,
      nextOffset: 0,
    });
  });

  it("shows an empty-state prompt when there are no posts", async () => {
    await renderPage();
    expect(screen.getByText(/your story can be the first one/i)).toBeInTheDocument();
  });

  it("describes board as a free travel board", async () => {
    await renderPage();
    expect(screen.getByRole("heading", { name: /travel board/i })).toBeInTheDocument();
    expect(screen.getByText(/questions, tips, and stories are all welcome/i)).toBeInTheDocument();
  });

  it("has a first-question CTA to the write page", async () => {
    await renderPage();
    expect(screen.getByRole("link", { name: /write the first post/i })).toHaveAttribute(
      "href",
      "/board/new",
    );
  });

  it("shows publish success message when redirected after creation", async () => {
    await renderPage({ created: "1" });
    expect(screen.getByText(/post published successfully/i)).toBeInTheDocument();
  });
});
