import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { validatePublicEnv } from "@/lib/env";
import { AUTH_ACCESS_COOKIE } from "@/lib/auth-cookies";

export type SessionUser = {
  id: string;
  email: string | null;
  avatarUrl: string | null;
};

export async function getSessionUserFromCookies(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_COOKIE)?.value;

  if (!accessToken) return null;

  const env = validatePublicEnv(process.env);
  const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  const avatarRaw = data.user.user_metadata?.avatar_url;
  const avatarUrl = typeof avatarRaw === "string" ? avatarRaw : null;

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    avatarUrl,
  };
}
