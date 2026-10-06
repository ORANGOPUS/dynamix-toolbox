import "../styles.css";
import Head from "next/head";
import { asset } from "../lib/asset";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={asset("favicon.ico")} type="image/x-icon" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
