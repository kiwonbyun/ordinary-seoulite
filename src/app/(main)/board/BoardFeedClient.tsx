"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "@/components/Button";
import { formatBoardStatus, type BoardPost } from "@/lib/board";

type BoardFeedClientProps = {
  initialPosts: BoardPost[];
  initialHasMore: boolean;
  initialOffset: number;
};

type LoadMoreResponse = {
  posts: BoardPost[];
  hasMore: boolean;
  nextOffset: number;
  error?: string;
};

export default function BoardFeedClient({ initialPosts, initialHasMore, initialOffset }: BoardFeedClientProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [offset, setOffset] = useState(initialOffset);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadMore() {
    if (loading || !hasMore) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/board/posts?offset=${offset}`, { cache: "no-store" });
      const data = (await response.json()) as LoadMoreResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load more posts.");
      }

      setPosts((current) => [...current, ...data.posts]);
      setHasMore(data.hasMore);
      setOffset(data.nextOffset);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load more posts.");
    } finally {
      setLoading(false);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-white/45 p-7">
        <h2 className="text-2xl font-semibold">No posts yet. Your story can be the first one.</h2>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--text-secondary)]">
          Ask something, leave a review, or share one practical tip from your trip.
        </p>
        <div className="mt-5">
          <Button href="/board/new">Write the first post</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="space-y-4">
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

      {errorMessage ? (
        <p className="mt-4 text-sm text-[color:var(--accent-rose)]">{errorMessage}</p>
      ) : null}

      {hasMore ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => {
              void loadMore();
            }}
            disabled={loading}
            className="inline-flex rounded-full border border-[color:var(--border-strong)] px-4 py-2 text-sm transition-colors hover:bg-[color:var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
