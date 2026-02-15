import { createClient } from "@supabase/supabase-js";
import { validateSupabaseServerEnv } from "@/lib/env";

export function createServerSupabase() {
  const env = validateSupabaseServerEnv(process.env);
  return createClient(env.supabaseUrl, env.supabaseSecretKey, {
    auth: { persistSession: false },
  });
}
