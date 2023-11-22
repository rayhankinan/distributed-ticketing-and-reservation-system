import { z } from "npm:zod";

export const invoiceSchema = z.object({
  userId: z.string().uuid(),
  seatId: z.string().uuid(),
});
