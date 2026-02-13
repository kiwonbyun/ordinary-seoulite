export type RawEnv = Record<string, string | undefined>;

type ServerEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  siteUrl: string;
};

type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl: string;
};

const serverRequired = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const publicRequired = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SITE_URL",
] as const;

export function validateServerEnv(raw: RawEnv): ServerEnv {
  for (const key of serverRequired) {
    if (!raw[key]) {
      throw new Error(`Missing env: ${key}`);
    }
  }
  return {
    supabaseUrl: raw.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: raw.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey: raw.SUPABASE_SERVICE_ROLE_KEY!,
    stripeSecretKey: raw.STRIPE_SECRET_KEY!,
    stripeWebhookSecret: raw.STRIPE_WEBHOOK_SECRET!,
    siteUrl: raw.NEXT_PUBLIC_SITE_URL!,
  };
}

export function validatePublicEnv(raw: RawEnv): PublicEnv {
  for (const key of publicRequired) {
    if (!raw[key]) {
      throw new Error(`Missing env: ${key}`);
    }
  }
  return {
    supabaseUrl: raw.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: raw.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    siteUrl: raw.NEXT_PUBLIC_SITE_URL!,
  };
}
