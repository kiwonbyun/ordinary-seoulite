export default function ProfilePage() {
  return (
    <section
      data-testid="profile-page"
      className="theme-surface mt-6 rounded-3xl px-6 py-10 shadow-[0_8px_24px_rgba(31,35,48,0.06)]"
    >
      <h1 className="text-3xl font-semibold">About</h1>
      <p className="mt-4 text-[color:var(--text-secondary)]">
        A regular person living in Seoul. Real photo, real experiences, no hype.
      </p>
    </section>
  );
}
