"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createBoardPostAction } from "./actions";

export default function BoardPostForm() {
  const [postType, setPostType] = useState<"question" | "review" | "tip">("question");
  const [state, formAction, isPending] = useActionState(createBoardPostAction, { message: null });

  return (
    <form className="mt-6 space-y-5" action={formAction}>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Type</span>
        <input type="hidden" name="type" value={postType} />
        <Select value={postType} onValueChange={(value) => setPostType(value as typeof postType)}>
          <SelectTrigger aria-label="Type" className="w-full">
            <SelectValue placeholder="Select a post type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="question">Question</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="tip">Tip</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Title</span>
        <Input name="title" type="text" minLength={6} maxLength={120} required />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Location Tag (Optional)</span>
        <Input name="locationTag" type="text" maxLength={80} />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Body</span>
        <Textarea
          name="body"
          minLength={20}
          maxLength={2000}
          required
          rows={10}
          className="min-h-[260px]"
        />
      </label>

      {state.message ? <p className="text-sm text-[color:var(--accent-rose)]">{state.message}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Publishing..." : "Publish post"}
      </Button>
    </form>
  );
}
