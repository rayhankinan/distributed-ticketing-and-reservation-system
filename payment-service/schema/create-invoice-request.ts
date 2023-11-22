import { z } from "npm:zod";

export const requestSchema = z.object({
  seatId: z.string().uuid(),
});
