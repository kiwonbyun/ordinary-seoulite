import { requireSessionUser } from "@/lib/session-gate";
import BoardPostForm from "./BoardPostForm";

export default async function BoardNewPage() {
  await requireSessionUser("/board/new");

  return (
    <section className="theme-surface mt-6 rounded-3xl px-6 py-10 shadow-[0_8px_24px_rgba(31,35,48,0.06)]">
      <h1 className="text-3xl font-semibold">Write a post</h1>
      <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
        Share a question, a review, or a useful tip for fellow travelers.
      </p>
      <BoardPostForm />
    </section>
  );
}
