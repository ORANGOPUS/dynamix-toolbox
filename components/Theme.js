import Head from "next/head";
import { fontsUrl } from "../lib/fonts";

/** The theme as CSS variables, for everything inside <Theme>. */
export function themeVars(theme) {
  const shadow = theme.shadow / 100;
  return {
    "--accent": theme.accent,
    "--accent2": theme.accent2,
    "--bg": theme.background,
    "--surface": theme.surface,
    "--text": theme.text,
    "--muted": theme.muted,
    "--radius": `${theme.radius}px`,
    "--border": `${theme.borderWidth}px`,
    "--shadow": shadow ? `0 ${Math.round(4 + 20 * shadow)}px ${Math.round(16 + 64 * shadow)}px rgba(0, 0, 0, ${(0.15 + 0.4 * shadow).toFixed(2)})` : "none",
    "--heading-font": `"${theme.headingFont}", system-ui, sans-serif`,
    "--body-font": `"${theme.bodyFont}", system-ui, sans-serif`,
    "--heading-weight": theme.headingWeight,
    "--body-weight": theme.bodyWeight,
    "--heading-transform": theme.headingTransform,
    "--heading-spacing": `${theme.headingSpacing / 100}em`,
    "--scale": theme.fontScale / 100,
    "--angle": `${theme.gradientAngle}deg`,
    "--dim": theme.backgroundDim / 100,
    "--pattern-opacity": theme.patternOpacity / 100,
  };
}

/**
 * Applies a theme: colours, fonts, surface style, background and animation.
 * `transparent` drops the background (for OBS sources over gameplay).
 */
export default function Theme({ theme, transparent = false, className = "", children }) {
  const classes = [
    "theme",
    `card-${theme.cardStyle}`,
    `anim-${theme.animation}`,
    transparent ? "is-transparent" : `bg-${theme.backgroundType}`,
    className,
  ].join(" ");
  return (
    <div className={classes} style={themeVars(theme)}>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={fontsUrl([theme.headingFont, theme.bodyFont])} />
      </Head>
      {!transparent && (
        <div className="theme-bg" aria-hidden="true">
          {theme.backgroundType === "image" && theme.backgroundImage && (
            <div className="theme-bg-image" style={{ backgroundImage: `url("${theme.backgroundImage}")` }} />
          )}
          {theme.pattern !== "none" && <div className={`theme-pattern pattern-${theme.pattern}`} />}
        </div>
      )}
      {theme.customCss && <style>{theme.customCss}</style>}
      <div className="theme-content">{children}</div>
    </div>
  );
}
