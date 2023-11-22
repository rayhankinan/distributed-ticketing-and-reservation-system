import {
  Page,
  Text,
  Document,
  StyleSheet,
  PDFViewer,
  Font,
} from "@react-pdf/renderer";
import { z } from "zod";
import pdfSchema from "@/schemas";

// Register font
Font.register({
  family: "Oswald",
  src: "/fonts/Oswald-Regular.ttf",
});

// Create styles
const styles = StyleSheet.create({
  viewer: {
    width: "100vw",
    height: "100vh",
  },
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    fontFamily: "Oswald",
  },
  author: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    margin: 12,
    fontFamily: "Oswald",
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Times-Roman",
  },
  image: {
    marginVertical: 15,
    marginHorizontal: 100,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

// Create Document Component
const Viewer = ({ userId, seatId, status }: z.infer<typeof pdfSchema>) => (
  <PDFViewer style={styles.viewer}>
    <Document>
      <Page style={styles.body}>
        <Text style={styles.header}>User ID: {userId}</Text>
        <Text style={styles.header}>Ticket ID: {seatId}</Text>
        <Text style={styles.header}>Status: {status}</Text>
      </Page>
    </Document>
  </PDFViewer>
);

export default Viewer;
