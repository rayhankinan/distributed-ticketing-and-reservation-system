import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const Viewer = dynamic(() => import("@/components/Viewer"), {
  ssr: false,
});

export default function PDFViewer() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "-";

  return <Viewer username={username} />;
}
