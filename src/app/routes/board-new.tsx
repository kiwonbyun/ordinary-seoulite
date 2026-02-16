import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadBoardEditorImage } from "@/features/board/api";
import { useCreateBoardPost } from "@/features/board/hooks";
import type { BoardPostType } from "@/features/board/types";
import { getAuthRedirectPath, useAuthSession } from "@/features/auth/hooks";
import { BoardBodyEditor } from "@/features/board/BoardBodyEditor";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function toPlainTextLength(html: string) {
  return html.replace(/<[^>]+>/g, "").trim().length;
}

export function BoardNewRoute() {
  const navigate = useNavigate();
  const { user, loading } = useAuthSession();
  const createPost = useCreateBoardPost();

  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<BoardPostType>("question");
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});

  const typeOptions = [
    { value: "question", label: "Question" },
    { value: "review", label: "Review" },
    { value: "tip", label: "Tip" },
  ];

  const titleLength = title.trim().length;
  const bodyTextLength = toPlainTextLength(body);

  useEffect(() => {
    const redirectTo = getAuthRedirectPath("/board/new", Boolean(user));
    if (!loading && redirectTo) {
      void navigate({ to: redirectTo, replace: true });
    }
  }, [loading, navigate, user]);

  const validateForm = () => {
    const nextErrors: { title?: string; body?: string } = {};
    if (titleLength < 5) {
      nextErrors.title = "Title must be at least 5 characters.";
    }
    if (bodyTextLength < 10) {
      nextErrors.body = "Body must be at least 10 characters.";
    }
    return nextErrors;
  };

  const handleCreatePost = async () => {
    if (pending) return;
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.body) return;

    setPending(true);
    try {
      await createPost.mutateAsync({
        type,
        title: title.trim(),
        body,
      });
      toast.success("Post created");
      void navigate({ to: "/board", replace: true });
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : "Failed to create post.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="space-y-8 py-6">
      <header className="space-y-2 border-b pb-5">
        <h1 className="font-editorial text-4xl leading-none">Write Post</h1>
        <p className="text-sm text-muted-foreground">Create a new board post with optional images.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="post-title">Title</Label>
          <Input
            id="post-title"
            value={title}
            onChange={(event) => {
              const nextTitle = event.target.value;
              setTitle(nextTitle);
              if (errors.title && nextTitle.trim().length >= 5) {
                setErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            placeholder="Write a title"
            className={cn(errors.title ? "border-destructive focus-visible:ring-destructive/35" : "")}
          />
          {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="post-body">Body</Label>
          <div className={cn("rounded-sm", errors.body ? "ring-1 ring-destructive/60" : "")}>
            <BoardBodyEditor
              value={body}
              onChange={(nextBody) => {
                setBody(nextBody);
                if (errors.body && toPlainTextLength(nextBody) >= 10) {
                  setErrors((prev) => ({ ...prev, body: undefined }));
                }
              }}
              onImageUpload={uploadBoardEditorImage}
            />
          </div>
          <p className="text-xs text-muted-foreground">Use toolbar image button to upload (jpg/png/webp, up to 8MB).</p>
          {errors.body ? <p className="text-xs text-destructive">{errors.body}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tag</Label>
          <Combobox value={type} onChange={(value) => setType((value as BoardPostType) || "question")} options={typeOptions} placeholder="Select tag" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => void handleCreatePost()} disabled={pending || createPost.isPending}>
          {pending ? "Posting..." : "Create Post"}
        </Button>
        <Button asChild variant="outline">
          <Link to="/board">Cancel</Link>
        </Button>
      </div>
    </section>
  );
}
