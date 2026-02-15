import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { DmMessage } from "./types";

type SupabaseLike = Pick<SupabaseClient, "from">;

type DmMessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

function mapRow(row: DmMessageRow): DmMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

async function getOrCreateThread(userId: string, client: SupabaseLike) {
  const { data: existing, error: findError } = await client
    .from("dm_threads")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (findError) throw new Error(`Failed to resolve thread: ${findError.message}`);
  if (existing?.id) return existing.id as string;

  const { data: created, error: createError } = await client
    .from("dm_threads")
    .insert({ user_id: userId, status: "open" })
    .select("id")
    .single();

  if (createError) throw new Error(`Failed to create thread: ${createError.message}`);
  return created.id as string;
}

export async function fetchDmMessages(userId: string, client: SupabaseLike = supabase) {
  const threadId = await getOrCreateThread(userId, client);
  const { data, error } = await client
    .from("dm_messages")
    .select("id,thread_id,sender_id,body,created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load dm messages: ${error.message}`);
  return ((data ?? []) as DmMessageRow[]).map(mapRow);
}

export async function sendDmMessage(userId: string, body: string, client: SupabaseLike = supabase) {
  const threadId = await getOrCreateThread(userId, client);

  const { data, error } = await client
    .from("dm_messages")
    .insert({ thread_id: threadId, sender_id: userId, body })
    .select("id,thread_id,sender_id,body,created_at")
    .single();

  if (error) throw new Error(`Failed to send message: ${error.message}`);
  return mapRow(data as DmMessageRow);
}
