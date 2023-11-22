import { z } from "npm:zod";

export const requestSchema = z.object({
  id: z.string().uuid(),
});
