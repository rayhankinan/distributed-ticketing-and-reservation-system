import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <main className="dark text-foreground bg-background">
        <Toaster />
        <Component {...pageProps} />
      </main>
    </NextUIProvider>
  );
}
