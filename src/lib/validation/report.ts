import { z } from "zod";

export const reportSchema = z.object({
  contextType: z.enum(["board", "dm", "gallery"]),
  contextId: z.string().uuid(),
  reason: z.string().min(4).max(500),
});
