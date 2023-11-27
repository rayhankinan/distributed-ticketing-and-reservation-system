import {
  type InferGetServerSidePropsType,
  type GetServerSideProps,
} from "next";
import dynamic from "next/dynamic";
import { createHmac } from "crypto";
import { z } from "zod";
import { pdfSchema } from "@/schemas";

const Viewer = dynamic(() => import("@/components/Viewer"), {
  ssr: false,
});

export const getServerSideProps = (async (context) => {
  const { data, hash } = context.query;

  // Check if data or hash is present
  if (!data || !hash || data instanceof Array || hash instanceof Array)
    return { props: { data: null } };

  // Check if hash is valid
  const newHash = createHmac("sha256", "dhika-jelek")
    .update(data)
    .digest("base64url");

  if (newHash !== hash) return { props: { data: null } };

  // Decode data
  const object = JSON.parse(Buffer.from(data, "base64url").toString("ascii"));

  // Check if data is valid
  const parsed = pdfSchema.safeParse(object);

  if (!parsed.success)
    return {
      props: { data: null },
    };

  return { props: { data: parsed.data } };
}) satisfies GetServerSideProps<{
  data: z.infer<typeof pdfSchema> | null;
}>;

export default function PDFViewer({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!data) return;

  return <Viewer {...data} />;
}
