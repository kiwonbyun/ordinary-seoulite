type RawSessionUser = {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

export type SessionUserView = {
  email: string;
  avatarUrl: string | null;
  initial: string;
};

export function toSessionUserView(user: RawSessionUser): SessionUserView {
  const email = user.email ?? "Signed-in user";
  const avatarRaw = user.user_metadata?.avatar_url;
  const avatarUrl = typeof avatarRaw === "string" ? avatarRaw : null;
  const initial = email.slice(0, 1).toUpperCase() || "U";

  return { email, avatarUrl, initial };
}
