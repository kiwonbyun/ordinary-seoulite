import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { TipInput, TipRecord } from "./types";

type SupabaseLike = Pick<SupabaseClient, "from">;

type TipRow = {
  id: string;
  user_id: string;
  target_type: "dm" | "board";
  target_id: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
};

function mapRow(row: TipRow): TipRecord {
  return {
    id: row.id,
    userId: row.user_id,
    targetType: row.target_type,
    targetId: row.target_id,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
  };
}

export async function createTip(input: TipInput, client: SupabaseLike = supabase) {
  const { data, error } = await client
    .from("tips")
    .insert({
      user_id: input.userId,
      target_type: input.targetType,
      target_id: input.targetId,
      amount: input.amount,
      currency: input.currency,
      status: "pending",
    })
    .select("id,user_id,target_type,target_id,amount,currency,status")
    .single();

  if (error) throw new Error(`Failed to create tip: ${error.message}`);
  return mapRow(data as TipRow);
}
