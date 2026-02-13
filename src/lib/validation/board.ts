import { z } from "zod";

export const boardPostSchema = z.object({
  title: z.string().min(6).max(120),
  body: z.string().min(20).max(2000),
  locationTag: z.string().optional(),
});

export const boardReplySchema = z.object({
  body: z.string().min(5).max(1500),
});
