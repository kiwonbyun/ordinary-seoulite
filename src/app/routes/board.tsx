import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoardPosts, useCreateBoardPost } from "@/features/board/hooks";
import type { BoardPostType } from "@/features/board/types";
import { formatBoardStatus } from "@/features/board/utils";
import { toast } from "sonner";

export function BoardRoute() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/board" });
  const filters = { search: search.q ?? "", type: (search.type as BoardPostType | "all" | undefined) ?? "all" } as const;
  const { data = [], isLoading, error } = useBoardPosts(filters);
  const createPost = useCreateBoardPost(filters);

  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("First-time Seoul traveler neighborhood question");
  const [location, setLocation] = useState("seoul");
  const [type, setType] = useState<BoardPostType>("question");

  const locationOptions = [
    { value: "seoul", label: "Seoul" },
    { value: "hongdae", label: "Hongdae" },
    { value: "gangnam", label: "Gangnam" },
    { value: "itaewon", label: "Itaewon" },
  ];

  const typeOptions = [
    { value: "all", label: "All" },
    { value: "question", label: "Question" },
    { value: "review", label: "Review" },
    { value: "tip", label: "Tip" },
  ];

  const handleQuickPost = async () => {
    if (pending) return;
    setPending(true);
    try {
      await createPost.mutateAsync({
        type,
        title,
        body: "Any recommendations for neighborhoods with easy transit and late-night food options?",
        locationTag: location,
      });
      toast.success("Post created");
      setTitle("");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="space-y-8 py-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="font-editorial text-5xl leading-none">Travel Board</h1>
          <p className="mt-2 text-base leading-7 text-muted-foreground content-measure">
            Ask questions, post reviews, or share practical tips.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Board menu">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast("Newest first is default")}>Sort: Newest</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast("Use top filters for tag/search")}>Filter Help</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 border-b pb-6 md:grid-cols-3">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="post-title">Quick post title</Label>
          <Input id="post-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ask your question title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Combobox value={location} onChange={setLocation} options={locationOptions} placeholder="Select location" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tag</Label>
          <Combobox
            value={type}
            onChange={(value) => setType((value as BoardPostType) || "question")}
            options={typeOptions.filter((o) => o.value !== "all")}
            placeholder="Select tag"
          />
        </div>
        <div className="md:col-span-3">
          <Button onClick={() => void handleQuickPost()} disabled={pending || createPost.isPending || title.length < 6}>
            {pending ? "Posting..." : "Create Post"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 border-b pb-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="search">Search posts</Label>
          <Input
            id="search"
            value={search.q ?? ""}
            placeholder="Filter by title or location"
            onChange={(event) => {
              const q = event.target.value.trim();
              void navigate({
                to: "/board",
                search: {
                  q,
                  type: filters.type,
                },
                replace: true,
              });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type-filter">Type filter</Label>
          <Combobox
            value={filters.type}
            onChange={(value) => {
              const typeValue = (value || "all") as "all" | "question" | "review" | "tip";
              void navigate({
                to: "/board",
                search: {
                  q: search.q ?? "",
                  type: typeValue,
                },
                replace: true,
              });
            }}
            options={typeOptions}
            placeholder="Filter by type"
          />
        </div>
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
      {error ? <p className="text-sm text-destructive">Failed to load posts.</p> : null}
      <div className="divide-y">
        {data.map((post) => (
          <article key={post.id} className="flex items-start justify-between gap-4 py-4">
            <div className="space-y-1">
              <h2 className="font-editorial text-2xl leading-tight">
                <Link to="/board/$postId" params={{ postId: post.id }} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm text-muted-foreground">{post.locationTag ?? "Seoul"}</p>
            </div>
            <Badge variant={post.status === "answered" ? "secondary" : "default"}>{formatBoardStatus(post.status)}</Badge>
          </article>
        ))}
      </div>
    </section>
  );
}
