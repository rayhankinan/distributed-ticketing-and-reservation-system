import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "sonner";
import { persistor, store } from "@/redux/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <main className="dark text-foreground bg-background">
            <Toaster />
            <Component {...pageProps} />
          </main>
        </PersistGate>
      </Provider>
    </NextUIProvider>
  );
}
