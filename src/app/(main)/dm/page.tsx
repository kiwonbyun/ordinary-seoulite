export default function DMPage() {
  return (
    <section
      data-testid="dm-page"
      className="theme-surface mt-6 rounded-3xl px-6 py-10 shadow-[0_8px_24px_rgba(31,35,48,0.06)]"
    >
      <h1 className="text-3xl font-semibold">Private DM</h1>
      <p className="mt-4 text-[color:var(--text-secondary)]">
        Ask privately and receive a response within 24 hours. Tips are optional.
      </p>
    </section>
  );
}
