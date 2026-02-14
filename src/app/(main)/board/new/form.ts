import { boardPostSchema } from "@/lib/validation/board";

export type BoardPostInput = {
  type: "question" | "review" | "tip";
  title: string;
  body: string;
  locationTag?: string;
};

export type BoardPostPayload = {
  type: BoardPostInput["type"];
  title: string;
  body: string;
  location_tag: string | null;
};

export function parseBoardPostFormData(formData: FormData) {
  const parsed = boardPostSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    body: formData.get("body"),
    locationTag: formData.get("locationTag") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Please check the required fields.",
    };
  }

  return {
    success: true as const,
    data: parsed.data,
  };
}

export function toBoardPostPayload(input: BoardPostInput): BoardPostPayload {
  return {
    type: input.type,
    title: input.title,
    body: input.body,
    location_tag: input.locationTag ? input.locationTag : null,
  };
}
