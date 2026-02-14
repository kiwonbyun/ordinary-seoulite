import Link from "next/link";
import Button from "@/components/Button";
import { formatBoardStatus, type BoardPost } from "@/lib/board";

const posts: BoardPost[] = [];

type BoardPageProps = {
  searchParams?: Promise<{
    created?: string;
  }>;
};

export default async function BoardPage({ searchParams }: BoardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const created = params?.created === "1";

  return (
    <section className="theme-surface mt-6 rounded-3xl px-6 py-10 shadow-[0_8px_24px_rgba(31,35,48,0.06)]">
      {created ? (
        <p className="mb-4 rounded-xl border border-[color:var(--accent-warm)]/35 bg-[color:var(--bg-elevated)] px-4 py-3 text-sm text-[color:var(--text-primary)]">
          Post published successfully.
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Travel Board</h1>
        <Button href="/board/new">Write a post</Button>
      </div>
      <p className="mt-4 text-sm text-[color:var(--text-secondary)]">
        Talk freely about your Korea trip - questions, tips, and stories are all welcome.
      </p>
      {posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-white/45 p-7">
          <h2 className="text-2xl font-semibold">No posts yet. Your story can be the first one.</h2>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--text-secondary)]">
            Ask something, leave a review, or share one practical tip from your trip.
          </p>
          <div className="mt-5">
            <Button href="/board/new">Write the first post</Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/board/${post.id}`}
              className="theme-surface block rounded-2xl p-5 transition-colors hover:border-[color:var(--border-strong)]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
                {post.locationTag}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
                {formatBoardStatus(post.status)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
