import Button from "@/components/Button";

export default function Page() {
  return (
    <section className="py-12">
      <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Seoul, Korea</p>
      <h1 className="mt-4 text-4xl font-semibold">
        Ask a local in Seoul — get answers within 24 hours.
      </h1>
      <p className="mt-4 max-w-2xl text-neutral-700">
        I am a regular person living in Seoul. Ask about food, neighborhoods, etiquette,
        or the small details that make your first trip feel easy.
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/dm">DM a question</Button>
        <Button href="/board" variant="ghost">
          Browse questions
        </Button>
      </div>
    </section>
  );
}
