import { persistor, store } from "@/redux/store";
import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";

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
