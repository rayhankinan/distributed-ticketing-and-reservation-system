import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "sonner";
import { store } from "@/redux/store";
import { Provider } from "react-redux";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <Provider store={store}>
        <main className="dark text-foreground bg-background">
          <Toaster />
          <Component {...pageProps} />
        </main>
      </Provider>
    </NextUIProvider>
  );
}
