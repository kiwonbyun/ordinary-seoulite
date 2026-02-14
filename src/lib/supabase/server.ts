import { createClient } from "@supabase/supabase-js";
import { validateSupabaseServerEnv } from "@/lib/env";

const env = validateSupabaseServerEnv(process.env);

export function createServerSupabase() {
  return createClient(env.supabaseUrl, env.supabaseSecretKey, {
    auth: { persistSession: false },
  });
}
