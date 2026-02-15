import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

function resolvePublicEnv() {
  try {
    return getPublicEnv(import.meta.env as Record<string, string | undefined>);
  } catch {
    return {
      url: "http://localhost:54321",
      anon: "public-anon-key",
    };
  }
}

const env = resolvePublicEnv();

export const supabase = createClient(env.url, env.anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
