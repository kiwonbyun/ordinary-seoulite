import { z } from "zod";

export const dmThreadSchema = z.object({
  message: z.string().min(10).max(2000),
});

export const dmMessageSchema = z.object({
  body: z.string().min(1).max(2000),
});
