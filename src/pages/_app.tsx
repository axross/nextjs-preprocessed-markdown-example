import type { AppProps } from "next/app";
import "../global.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="app">
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
