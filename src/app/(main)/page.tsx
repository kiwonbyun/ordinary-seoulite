import Button from "@/components/Button";

export default function Page() {
  return (
    <section
      data-testid="landing-hero"
      className="relative mt-6 overflow-hidden rounded-3xl px-6 py-14 text-[color:var(--text-inverse)] shadow-[0_20px_50px_rgba(31,35,48,0.24)] md:px-10"
    >
      <div data-testid="landing-hero-media" className="landing-hero-media absolute inset-0" />
      <div data-testid="landing-hero-overlay" className="landing-hero-overlay absolute inset-0" />
      <div className="relative z-10">
        <p className="text-xs uppercase tracking-[0.3em] text-white/80">Seoul, Korea</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold md:text-5xl">
          Ask a local in Seoul - get answers within 24 hours.
        </h1>
        <p className="mt-4 max-w-2xl text-white/85">
          I am a regular person living in Seoul. Ask about food, neighborhoods, etiquette,
          or the small details that make your first trip feel easy.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/dm">DM a question</Button>
          <Button href="/board" variant="ghost">
            Browse questions
          </Button>
        </div>
      </div>
    </section>
  );
}
