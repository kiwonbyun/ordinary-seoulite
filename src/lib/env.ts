export type RawEnv = Record<string, string | undefined>;

type ServerEnv = {
  supabaseUrl: string;
  supabasePublishableKey: string;
  supabaseSecretKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  siteUrl: string;
};

type SupabaseServerEnv = {
  supabaseUrl: string;
  supabaseSecretKey: string;
};

type PublicEnv = {
  supabaseUrl: string;
  supabasePublishableKey: string;
  siteUrl: string;
};

const serverRequired = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const publicRequired = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const supabaseServerRequired = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
] as const;

export function validateServerEnv(raw: RawEnv): ServerEnv {
  for (const key of serverRequired) {
    if (!raw[key]) {
      throw new Error(`Missing env: ${key}`);
    }
  }
  return {
    supabaseUrl: raw.NEXT_PUBLIC_SUPABASE_URL!,
    supabasePublishableKey: raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    supabaseSecretKey: raw.SUPABASE_SECRET_KEY!,
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
    supabasePublishableKey: raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    siteUrl: raw.NEXT_PUBLIC_SITE_URL!,
  };
}

export function validateSupabaseServerEnv(raw: RawEnv): SupabaseServerEnv {
  for (const key of supabaseServerRequired) {
    if (!raw[key]) {
      throw new Error(`Missing env: ${key}`);
    }
  }

  return {
    supabaseUrl: raw.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseSecretKey: raw.SUPABASE_SECRET_KEY!,
  };
}
