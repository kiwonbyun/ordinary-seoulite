import Link from "next/link";
import { formatBoardStatus, type BoardPost } from "@/lib/board";

const demoPosts: BoardPost[] = [
  {
    id: "demo-1",
    title: "First trip to Seoul: where should I stay?",
    body: "...",
    locationTag: "Seoul",
    status: "open",
  },
];

export default function BoardPage() {
  return (
    <section className="py-10">
      <h1 className="text-3xl font-semibold">Public Questions</h1>
      <div className="mt-6 space-y-4">
        {demoPosts.map((post) => (
          <Link
            key={post.id}
            href={`/board/${post.id}`}
            className="block rounded-2xl border border-neutral-200 p-5"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              {post.locationTag}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{formatBoardStatus(post.status)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
