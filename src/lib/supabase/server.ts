import { createClient } from "@supabase/supabase-js";
import { validateServerEnv } from "@/lib/env";

const env = validateServerEnv(process.env);

export function createServerSupabase() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}
