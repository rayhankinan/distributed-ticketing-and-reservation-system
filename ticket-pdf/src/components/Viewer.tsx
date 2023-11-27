import {
  Page,
  Text,
  Document,
  StyleSheet,
  PDFViewer,
  Font,
  Image,
  View,
} from "@react-pdf/renderer";
import { z } from "zod";
import pdfSchema from "@/schemas";
import QRCode from "qrcode";
import { useState, useEffect } from "react";

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
    backgroundColor: "#E7F8FC",
  },
  concertImage: {
    width: "100%",
  },
  infoContainer: {
    padding: 32,
  },
  heading: {
    fontFamily: "Oswald",
    fontSize: "48px",
    fontWeight: "bold",
  },
  miniText: {
    fontFamily: "Oswald",
    fontSize: "12px",
  },
  qr: {
    width: 300,
    height: 300,
    marginTop: 16,
    marginHorizontal: "auto",
  },
});

// Create Document Component
const Viewer = ({ userId, seatId, status }: z.infer<typeof pdfSchema>) => {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(seatId, function (err, url) {
      if (!err) {
        setQrUrl(url);
      }
    });
  }, []);

  if (!qrUrl) return <h1 style={styles.heading}>Loading ...</h1>;

  if (status === "SUCCESS") {
    return (
      <PDFViewer style={styles.viewer}>
        <Document>
          <Page size="A4" style={styles.body}>
            <View>
              <Image src="/concert.png" style={styles.concertImage} />
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.heading}>Here is your ticket!</Text>
              <Text style={styles.miniText}>User ID: {userId}</Text>
              <Text style={styles.miniText}>Status: {status}</Text>
              <Image src={qrUrl} style={styles.qr} />
            </View>
          </Page>
        </Document>
      </PDFViewer>
    );
  } else {
    <PDFViewer style={styles.viewer}>
      <Document>
        <Page size="A4" style={styles.body}>
          <View>
            <Image src="/concert.png" style={styles.concertImage} />
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.heading}>Your ticket cannot be used!</Text>
            <Text style={styles.miniText}>User ID: {userId}</Text>
            <Text style={styles.miniText}>Status: {status}</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>;
  }
};

export default Viewer;
