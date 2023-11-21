import { NextPage } from "next";
import dynamic from "next/dynamic";

const Viewer = dynamic(() => import("@/components/Viewer"), {
  ssr: false,
});

const PDFViewer: NextPage = () => <Viewer />;

export default PDFViewer;
