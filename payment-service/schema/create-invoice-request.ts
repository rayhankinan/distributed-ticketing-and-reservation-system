import { z } from "npm:zod";

export const createInvoiceRequestSchema = z.object({
  seatId: z.string().uuid(),
});
