import Button from "@/components/Button";
import { BOARD_PAGE_SIZE, fetchBoardPostsPage } from "@/lib/board-posts";
import BoardFeedClient from "./BoardFeedClient";

type BoardPageProps = {
  searchParams?: Promise<{
    created?: string;
  }>;
};

export default async function BoardPage({ searchParams }: BoardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const created = params?.created === "1";
  const page = await fetchBoardPostsPage({ offset: 0, limit: BOARD_PAGE_SIZE });

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
      <BoardFeedClient
        initialPosts={page.posts}
        initialHasMore={page.hasMore}
        initialOffset={page.nextOffset}
      />
    </section>
  );
}
