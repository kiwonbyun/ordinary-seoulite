import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { BoardPost, BoardPostFilters, CreateBoardPostInput } from "./types";

type BoardPostRow = {
  id: string;
  type: BoardPost["type"];
  title: string;
  body: string;
  location_tag: string | null;
  status: string | null;
  created_at: string;
  author_id: string;
};

function mapRow(row: BoardPostRow): BoardPost {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    locationTag: row.location_tag,
    status: row.status === "answered" ? "answered" : "open",
    createdAt: row.created_at,
    authorId: row.author_id,
  };
}

type SupabaseLike = Pick<SupabaseClient, "from">;

export async function fetchBoardPosts(
  input: { offset: number; limit: number; filters?: BoardPostFilters },
  client: SupabaseLike = supabase,
) {
  const to = input.offset + input.limit - 1;
  let query = client
    .from("board_posts")
    .select("id,type,title,body,location_tag,status,created_at,author_id")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (input.filters?.type && input.filters.type !== "all") {
    query = query.eq("type", input.filters.type);
  }

  if (input.filters?.search?.trim()) {
    const term = input.filters.search.trim();
    query = query.or(`title.ilike.%${term}%,location_tag.ilike.%${term}%`);
  }

  const { data, error } = await query.range(input.offset, to);

  if (error) throw new Error(`Failed to load posts: ${error.message}`);
  return ((data ?? []) as BoardPostRow[]).map(mapRow);
}

export async function fetchBoardPostById(id: string, client: SupabaseLike = supabase) {
  const { data, error } = await client
    .from("board_posts")
    .select("id,type,title,body,location_tag,status,created_at,author_id")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Failed to load post: ${error.message}`);
  return mapRow(data as BoardPostRow);
}

export async function createBoardPost(input: CreateBoardPostInput, client: SupabaseLike = supabase) {
  const payload = {
    type: input.type,
    title: input.title,
    body: input.body,
    location_tag: input.locationTag ?? null,
  };
  const { data, error } = await client
    .from("board_posts")
    .insert(payload)
    .select("id,type,title,body,location_tag,status,created_at,author_id")
    .single();

  if (error) throw new Error(`Failed to create post: ${error.message}`);
  return mapRow(data as BoardPostRow);
}
