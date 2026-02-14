"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSessionUserFromCookies } from "@/lib/server-auth";
import { parseBoardPostFormData, toBoardPostPayload } from "./form";

export type CreateBoardPostState = {
  message: string | null;
};

export async function createBoardPostAction(
  _prevState: CreateBoardPostState,
  formData: FormData,
): Promise<CreateBoardPostState> {
  const parsed = parseBoardPostFormData(formData);
  if (!parsed.success) {
    return { message: parsed.message };
  }

  const sessionUser = await getSessionUserFromCookies();
  if (!sessionUser) {
    return { message: "Session expired. Please sign in again." };
  }

  const supabase = createServerSupabase();
  const { error: userError } = await supabase.from("users").upsert(
    {
      id: sessionUser.id,
      display_name: sessionUser.email,
      photo_url: null,
    },
    { onConflict: "id" },
  );

  if (userError) {
    return { message: `Failed to sync user profile: ${userError.message}` };
  }

  const { error } = await supabase.from("board_posts").insert({
    ...toBoardPostPayload(parsed.data),
    author_id: sessionUser.id,
  });

  if (error) {
    return { message: `Failed to publish post: ${error.message}` };
  }

  redirect("/board?created=1");
}
