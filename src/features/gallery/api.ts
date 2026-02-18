import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { canManageGallery } from "@/features/auth/hooks";
import type { CreateGalleryItemInput, GalleryItem } from "./types";

type SupabaseLike = Pick<SupabaseClient, "from">;
type AuthUserLike = { id: string; app_metadata?: { role?: string } };
type UploadGalleryImage = (file: File) => Promise<string>;
type GetCurrentUser = () => Promise<AuthUserLike>;
const GALLERY_BUCKET = "gallery-images";
const MAX_GALLERY_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_GALLERY_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

function validateGalleryFile(file: File) {
  if (!ALLOWED_GALLERY_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG, and WEBP images are allowed.");
  }
  if (file.size > MAX_GALLERY_IMAGE_BYTES) {
    throw new Error("Image must be 8MB or smaller.");
  }
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

export async function uploadGalleryImage(file: File) {
  validateGalleryFile(file);
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `gallery/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(GALLERY_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (uploadError) {
    throw new Error(`Failed to upload gallery image: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function getCurrentUser(): Promise<AuthUserLike> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("You must be signed in to create gallery items.");
  }
  return { id: data.user.id, app_metadata: data.user.app_metadata as { role?: string } | undefined };
}

export async function createGalleryItem(
  input: CreateGalleryItemInput,
  deps?: {
    client?: SupabaseLike;
    getCurrentUser?: GetCurrentUser;
    uploadImage?: UploadGalleryImage;
  },
) {
  const client = deps?.client ?? supabase;
  const readCurrentUser = deps?.getCurrentUser ?? getCurrentUser;
  const uploadImage = deps?.uploadImage ?? uploadGalleryImage;
  const user = await readCurrentUser();
  const role = user.app_metadata?.role;
  if (!canManageGallery(role ?? null)) {
    throw new Error("Only admins can create gallery items.");
  }

  const imageUrl = await uploadImage(input.imageFile);
  const caption = input.caption?.trim() || null;
  const locationTag = input.locationTag?.trim() || null;

  const { data, error } = await client
    .from("gallery_items")
    .insert({
      image_url: imageUrl,
      caption,
      location_tag: locationTag,
      created_by: user.id,
    })
    .select("id,image_url,caption,location_tag,created_at")
    .single();
  if (error) {
    throw new Error(`Failed to create gallery item: ${error.message}`);
  }
  return mapRow(data as GalleryRow);
}
