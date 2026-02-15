import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { GalleryItem } from "./types";

type SupabaseLike = Pick<SupabaseClient, "from">;

type GalleryRow = {
  id: string;
  image_url: string;
  caption: string | null;
  location_tag: string | null;
  created_at: string;
};

function mapRow(row: GalleryRow): GalleryItem {
  return {
    id: row.id,
    imageUrl: row.image_url,
    caption: row.caption,
    locationTag: row.location_tag,
    createdAt: row.created_at,
  };
}

export async function fetchGalleryItems(client: SupabaseLike = supabase) {
  const { data, error } = await client
    .from("gallery_items")
    .select("id,image_url,caption,location_tag,created_at")
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) throw new Error(`Failed to load gallery: ${error.message}`);
  return ((data ?? []) as GalleryRow[]).map(mapRow);
}
