import { createClient } from "@supabase/supabase-js";
import { validatePublicEnv } from "@/lib/env";

const env = validatePublicEnv(process.env);

export function createBrowserSupabase() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
