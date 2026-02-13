import { z } from "zod";

export const tipSchema = z.object({
  amount: z.number().int().min(1).max(200),
  currency: z.string().min(3).max(3),
  contextType: z.enum(["board", "dm"]),
  contextId: z.string().uuid(),
});
