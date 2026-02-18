import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBoardPosts } from "@/features/board/hooks";
import type { BoardPost } from "@/features/board/types";

function formatAuthor(post: BoardPost) {
  if (post.authorDisplayName) return post.authorDisplayName;
  return "Unknown author";
}

export function BoardRoute() {
  const { data = [], isLoading, error } = useBoardPosts();

  return (
    <section className="space-y-8 py-6">
      <div className="flex items-end justify-between border-b pb-4">
        <div>
          <h1 className="font-editorial text-5xl leading-none">Travel Board</h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground content-measure">
            Ask questions, post reviews, or share practical tips.
          </p>
        </div>
        <Button asChild>
          <Link to="/board/new">Write Post</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive">Failed to load posts.</p>
      ) : null}

      {!isLoading && !error && data.length === 0 ? (
        <div className="rounded-sm border border-dashed p-10 text-center">
          <h2 className="font-editorial text-3xl leading-none">No posts yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Be the first to ask a Korea travel question.
          </p>
          <div className="mt-5">
            <Button asChild>
              <Link to="/board/new">Write Post</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {data.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map((post) => (
            <Link
              key={post.id}
              to="/board/$postId"
              params={{ postId: post.id }}
              className="group block cursor-pointer overflow-hidden rounded-sm border bg-background transition-colors hover:border-foreground/70"
            >
              <div className="relative">
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/0 to-black/50" />
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {post.type}
                  </p>
                </div>
                <h3 className="font-editorial text-2xl leading-tight group-hover:underline">{post.title}</h3>
                <p className="text-xs text-muted-foreground">
                  By {formatAuthor(post)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
