import Head from "next/head";

/** Applies the config's theme as CSS variables to everything inside it. */
export default function Theme({ theme, transparent = false, className = "", children }) {
  const font = theme.font.replace(/ /g, "+");
  const style = {
    "--accent": theme.accent,
    "--bg": transparent ? "transparent" : theme.background,
    "--surface": theme.surface,
    "--text": theme.text,
    "--muted": theme.muted,
    "--radius": `${theme.radius}px`,
    fontFamily: `"${theme.font}", system-ui, sans-serif`,
    backgroundImage: !transparent && theme.backgroundImage ? `url("${theme.backgroundImage}")` : undefined,
  };
  return (
    <div className={`theme ${className}`} style={style}>
      <Head>
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${font}:wght@400;500;600;700&display=swap`} />
      </Head>
      {children}
    </div>
  );
}
