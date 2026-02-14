export function resolveRedirectTarget(input: string | null | undefined, fallback = "/") {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//")) return fallback;
  return input;
}

export function buildLoginRedirectPath(redirectTo: string) {
  return `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
}
