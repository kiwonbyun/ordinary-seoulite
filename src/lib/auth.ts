export type UserRole = "user" | "verified" | "mod";
export type AuthUser = { id: string; role: UserRole } | null;

export function canPost(user: AuthUser) {
  return Boolean(user);
}

export function canReply(user: AuthUser) {
  return Boolean(user && (user.role === "verified" || user.role === "mod"));
}

export function canUploadGallery(user: AuthUser) {
  return Boolean(user && user.role === "mod");
}
