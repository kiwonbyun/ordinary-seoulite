import { createServerSupabase } from "@/lib/supabase/server";
import type { BoardPost } from "@/lib/board";

export const BOARD_PAGE_SIZE = 20;

type FetchBoardPostsPageInput = {
  offset: number;
  limit?: number;
};

function normalizeStatus(status: string | null | undefined): BoardPost["status"] {
  return status === "answered" ? "answered" : "open";
}

export async function fetchBoardPostsPage({ offset, limit = BOARD_PAGE_SIZE }: FetchBoardPostsPageInput) {
  const supabase = createServerSupabase();
  const to = offset + limit - 1;

  const { data, error } = await supabase
    .from("board_posts")
    .select("id,title,body,location_tag,status")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, to);

  if (error) {
    throw new Error(`Failed to load board posts: ${error.message}`);
  }

  const posts: BoardPost[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    locationTag: row.location_tag,
    status: normalizeStatus(row.status),
  }));

  return {
    posts,
    hasMore: posts.length === limit,
    nextOffset: offset + posts.length,
  };
}
