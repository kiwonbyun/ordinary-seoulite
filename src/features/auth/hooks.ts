import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export function getInitial(email: string | null | undefined) {
  if (!email) return "?";
  return email.trim().slice(0, 1).toUpperCase() || "?";
}

export function getAuthRedirectPath(pathname: string, isAuthenticated: boolean) {
  if (isAuthenticated) return null;
  const next = encodeURIComponent(pathname);
  return `/login?next=${next}`;
}

export function getSafeNextPath(nextPath: string | null | undefined, fallback = "/") {
  if (!nextPath) return fallback;
  if (!nextPath.startsWith("/")) return fallback;
  if (nextPath.startsWith("//")) return fallback;
  return nextPath;
}

export function canManageGallery(role: string | null | undefined) {
  return role === "admin";
}

type SessionState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

export function useAuthSession() {
  const [state, setState] = useState<SessionState>({ user: null, session: null, loading: true });

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setState({ user: data.session?.user ?? null, session: data.session ?? null, loading: false });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
