import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[color:var(--bg-base)]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/main-image.webp')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,12,22,0.78),rgba(11,22,40,0.58),rgba(6,12,22,0.82))]" />

      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-6 py-12">
        <section className="w-full max-w-xl rounded-2xl border border-white/15 bg-[color:var(--bg-elevated)]/72 px-7 py-9 text-center backdrop-blur-md md:px-10 md:py-11">
          <p className="text-xs uppercase tracking-[0.24em] text-white/75">Error 404</p>
          <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">Page not found</h1>
          <p className="mt-4 text-sm text-white/80 md:text-base">
            The Seoul alley you&apos;re looking for doesn&apos;t exist.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="btn-primary inline-flex min-w-40 items-center justify-center rounded-full px-5 py-2 text-sm"
            >
              Back to home
            </Link>
            <Link
              href="/board"
              className="inline-flex min-w-40 items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm text-white transition hover:bg-white/18"
            >
              Go to board
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
