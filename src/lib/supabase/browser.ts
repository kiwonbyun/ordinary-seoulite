import { createClient } from "@supabase/supabase-js";
import { validatePublicEnv } from "@/lib/env";

export function createBrowserSupabase() {
  const env = validatePublicEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  return createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: {
      flowType: "pkce",
    },
  });
}
