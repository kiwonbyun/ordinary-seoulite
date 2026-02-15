import { Link, useParams } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBoardPost } from "@/features/board/hooks";
import { formatBoardStatus } from "@/features/board/utils";

export function BoardDetailRoute() {
  const params = useParams({ from: "/board/$postId" });
  const { data, isLoading, error } = useBoardPost(params.postId);

  return (
    <section className="space-y-6 py-6">
      <header className="space-y-1 border-b pb-4">
        <h1 className="font-editorial text-4xl leading-none">Post Detail</h1>
        <p className="text-sm text-muted-foreground">Read the full context and continue privately if needed.</p>
      </header>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading post...</p> : null}
      {error ? <p className="text-sm text-destructive">Failed to load post.</p> : null}
      {data ? (
        <article className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-editorial text-4xl leading-[1.05]">{data.title}</h2>
            <Badge>{formatBoardStatus(data.status)}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{data.locationTag ?? "Seoul"}</p>
          <p className="max-w-3xl text-sm leading-7">{data.body}</p>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/dm">Send DM</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/dm">Send Tip</Link>
            </Button>
          </div>
        </article>
      ) : null}
    </section>
  );
}
