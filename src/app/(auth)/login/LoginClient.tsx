"use client";

import Link from "next/link";

type LoginClientProps = {
  redirectTo: string;
};

export default function LoginClient({ redirectTo }: LoginClientProps) {
  const startUrl = `/auth/start?redirectTo=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[color:var(--bg-base)]">
      <div
        className="absolute inset-y-0 left-0 w-full bg-cover bg-center md:w-1/2"
        style={{ backgroundImage: "url('/jong-ro.webp')" }}
      />
      <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(140deg,rgba(9,15,27,0.55),rgba(17,31,52,0.3),rgba(9,15,27,0.6))] md:w-1/2" />

      <div className="relative z-10 grid min-h-[100dvh] md:grid-cols-[1.15fr_1fr]">
        <div
          data-testid="login-media-panel"
          className="relative hidden min-h-[460px] md:block"
        >
          <p className="absolute bottom-5 left-5 text-xs uppercase tracking-[0.24em] text-white/85">
            Jong-ro, Seoul
          </p>
        </div>

        <div
          data-testid="login-form-panel"
          className="flex items-center px-6 py-10 md:px-8 md:py-12"
        >
          <div className="w-full max-w-md rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--bg-elevated)]/72 px-6 py-8 backdrop-blur-md md:px-8">
            <h1 className="text-3xl font-semibold">Sign in</h1>
            <p className="mt-4 text-[color:var(--text-secondary)]">
              Continue with Google to write a post on the travel board.
            </p>
            <Link
              href={startUrl}
              className="btn-primary mt-6 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm"
            >
              Continue with Google
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
