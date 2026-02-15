import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { getSafeNextPath, useAuthSession } from "@/features/auth/hooks";
import { toast } from "sonner";
import gwanghwamunImage from "@/app/assets/Gwanghwamun-optimized.jpg";

export function LoginRoute() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const nextPath = useMemo(() => getSafeNextPath(search.next, "/"), [search.next]);
  const { user, loading } = useAuthSession();

  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: nextPath, replace: true });
    }
  }, [loading, navigate, nextPath, user]);

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);

    try {
      const redirectTo = `${window.location.origin}/login?next=${encodeURIComponent(nextPath)}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Google authorize URL was not created.");
      window.location.assign(data.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google login failed.";
      toast.error(message);
      setGoogleLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed out.");
  };

  return (
    <section className="space-y-6 py-6">
      <figure className="relative overflow-hidden rounded-sm border">
        <img
          src={gwanghwamunImage}
          alt="Gwanghwamun Gate in Seoul"
          className="h-[62vh] min-h-[430px] w-full object-cover object-center"
        />
        <figcaption className="absolute bottom-4 right-4 text-[11px] tracking-[0.14em] text-white/85 uppercase">
          Gwanghwamun, Seoul
        </figcaption>

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <div className="max-w-2xl space-y-3 text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
            <h1 className="font-editorial text-5xl leading-[0.98] md:text-6xl">Login</h1>
            <p className="max-w-xl text-sm leading-6 text-white/90 md:text-base">
              Continue with Google to write posts, send private DM, and tip.
            </p>
            <Button
              onClick={() => void handleGoogleLogin()}
              disabled={googleLoading || loading}
              variant="outline"
              className="mt-2 border-white/80 bg-white/10 text-white hover:bg-white/20"
            >
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </Button>
          </div>
        </div>
      </figure>

      <div className="border-t pt-4">
        {loading ? <p className="text-sm text-muted-foreground">Checking session...</p> : null}
        {!loading && user ? (
          <div className="flex items-center gap-3">
            <p className="text-sm">Signed in as {user.email}</p>
            <Button size="sm" variant="outline" onClick={() => void handleSignOut()}>
              Sign out
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
