export type PublicEnvInput = Record<string, string | undefined>;

export function getPublicEnv(raw: PublicEnvInput) {
  const url = raw.VITE_SUPABASE_URL;
  const anon = raw.VITE_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error("Missing Supabase public env");
  }

  return { url, anon };
}

