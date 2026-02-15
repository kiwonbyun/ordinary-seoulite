import { z } from "zod";

export const boardPostSchema = z.object({
  type: z.enum(["question", "review", "tip"]),
  title: z.string().min(6).max(120),
  body: z.string().min(20).max(2000),
  locationTag: z.string().min(1).max(60).optional(),
});

