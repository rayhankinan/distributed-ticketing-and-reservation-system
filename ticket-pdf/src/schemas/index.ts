import { z } from "zod";

const pdfSchema = z.object({
  userId: z.string().uuid(),
});

export default pdfSchema;
