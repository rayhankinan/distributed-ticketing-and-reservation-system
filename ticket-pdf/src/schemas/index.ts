import { z } from "zod";
import { TicketStatus } from "@/enum";

export const pdfSchema = z.object({
  userId: z.string().uuid(),
  seatId: z.string().uuid(),
  status: z.nativeEnum(TicketStatus),
  failedReason: z.string().optional()
});
