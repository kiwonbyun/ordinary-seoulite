import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import fallbackThumbnail from "@/app/assets/main.jpg";
import { extractImageUrlsFromHtml, optimizeEditorImage, validateEditorImageFile } from "./editor-image";
import type {
  BoardPost,
  BoardPostFilters,
  BoardPostImage,
  CreateBoardPostInput,
} from "./types";

type BoardPostRow = {
  id: string;
  type: BoardPost["type"];
  title: string;
  body: string;
  location_tag: string | null;
  status: string | null;
  created_at: string;
  author_id: string;
  users?:
    | {
        display_name: string | null;
      }
    | {
        display_name: string | null;
      }[]
    | null;
  board_post_images?:
    | { id: string; image_url: string; position: number }[]
    | null;
};

function mapImages(
  images: BoardPostRow["board_post_images"]
): BoardPostImage[] {
  return (images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((image) => ({
      id: image.id,
      imageUrl: image.image_url,
      position: image.position,
    }));
}

function mapRow(row: BoardPostRow): BoardPost {
  const images = mapImages(row.board_post_images);
  const authorProfile = Array.isArray(row.users)
    ? row.users[0] ?? null
    : row.users ?? null;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    locationTag: row.location_tag,
    status: row.status === "answered" ? "answered" : "open",
    createdAt: row.created_at,
    authorId: row.author_id,
    authorDisplayName: authorProfile?.display_name ?? null,
    thumbnailUrl: images[0]?.imageUrl ?? fallbackThumbnail,
    images,
  };
}

type SupabaseLike = Pick<SupabaseClient, "from">;

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("You must be signed in to create a post.");
  }
  return data.user.id;
}

async function ensureUserProfileRow(userId: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("You must be signed in to create a post.");
  }

  const user = authData.user;
  const displayName =
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
    (typeof user.user_metadata?.user_name === "string" && user.user_metadata.user_name) ||
    null;
  const photoUrl =
    (typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url) ||
    (typeof user.user_metadata?.picture === "string" && user.user_metadata.picture) ||
    null;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id,email,display_name,photo_url")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to check profile: ${profileError.message}`);
  }

  if (profile) {
    const needsUpdate =
      profile.email !== (user.email ?? null) ||
      profile.display_name !== displayName ||
      profile.photo_url !== photoUrl;

    if (!needsUpdate) return;

    const { error: updateProfileError } = await supabase
      .from("users")
      .update({
        email: user.email ?? null,
        display_name: displayName,
        photo_url: photoUrl,
      })
      .eq("id", user.id);

    if (updateProfileError) {
      throw new Error(`Failed to update profile: ${updateProfileError.message}`);
    }
    return;
  }

  const { error: insertProfileError } = await supabase.from("users").insert({
    id: user.id,
    email: user.email ?? null,
    display_name: displayName,
    photo_url: photoUrl,
  });

  if (insertProfileError) {
    throw new Error(`Failed to create profile: ${insertProfileError.message}`);
  }
}

export async function fetchBoardPosts(
  input: { offset: number; limit: number; filters?: BoardPostFilters },
  client: SupabaseLike = supabase
) {
  const to = input.offset + input.limit - 1;
  let query = client
    .from("board_posts")
    .select(
      "id,type,title,body,location_tag,status,created_at,author_id,users(display_name),board_post_images(id,image_url,position)"
    )
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

export async function fetchBoardPostById(
  id: string,
  client: SupabaseLike = supabase
) {
  const { data, error } = await client
    .from("board_posts")
    .select(
      "id,type,title,body,location_tag,status,created_at,author_id,users(display_name),board_post_images(id,image_url,position)"
    )
    .eq("id", id)
    .single();

  if (error) throw new Error(`Failed to load post: ${error.message}`);
  return mapRow(data as BoardPostRow);
}

export async function createBoardPost(
  input: CreateBoardPostInput,
  client: SupabaseLike = supabase
) {
  const authorId = await getAuthenticatedUserId();
  await ensureUserProfileRow(authorId);

  const payload = {
    author_id: authorId,
    type: input.type,
    title: input.title,
    body: input.body,
    location_tag: input.locationTag ?? null,
  };
  const { data, error } = await client
    .from("board_posts")
    .insert(payload)
    .select(
      "id,type,title,body,location_tag,status,created_at,author_id,users(display_name),board_post_images(id,image_url,position)"
    )
    .single();

  if (error) throw new Error(`Failed to create post: ${error.message}`);
  return mapRow(data as BoardPostRow);
}

export async function uploadBoardEditorImage(file: File) {
  const validated = validateEditorImageFile(file);
  if (!validated.success) {
    throw new Error(validated.message);
  }

  const optimized = await optimizeEditorImage(file);
  const path = `editor/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from("board-post-images")
    .upload(path, optimized, {
      cacheControl: "3600",
      upsert: false,
      contentType: "image/webp",
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from("board-post-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function createBoardPostWithImages(input: CreateBoardPostInput) {
  const created = await createBoardPost(input);
  const imageUrls = extractImageUrlsFromHtml(input.body);
  if (imageUrls.length === 0) {
    return created;
  }

  const { error: imageInsertError } = await supabase
    .from("board_post_images")
    .insert(
      imageUrls.map((url, position) => ({
        post_id: created.id,
        image_url: url,
        position,
      }))
    );
  if (imageInsertError) {
    throw new Error(
      `Failed to save image metadata: ${imageInsertError.message}`
    );
  }

  return {
    ...created,
    thumbnailUrl: imageUrls[0] ?? created.thumbnailUrl,
    images: imageUrls.map((imageUrl, index) => ({
      id: `uploaded-${index}`,
      imageUrl,
      position: index,
    })),
  };
}
