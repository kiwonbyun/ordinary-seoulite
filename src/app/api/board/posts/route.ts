import { NextResponse } from "next/server";
import * as boardPosts from "@/lib/board-posts";

function parseOffset(input: string | null) {
  const value = Number(input ?? "0");
  if (!Number.isInteger(value) || value < 0) return 0;
  return value;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const offset = parseOffset(url.searchParams.get("offset"));

  try {
    const page = await boardPosts.fetchBoardPostsPage({
      offset,
      limit: boardPosts.BOARD_PAGE_SIZE,
    });
    return NextResponse.json(page);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load posts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
