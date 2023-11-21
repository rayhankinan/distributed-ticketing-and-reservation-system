import { z } from "zod";

const pdfSchema = z.object({
  username: z.string(),
});

export default pdfSchema;
