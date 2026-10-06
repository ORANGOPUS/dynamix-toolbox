// A searchable browser of every font, each name drawn in its own typeface.
// Loads one small stylesheet with only the letters the names need.
import Head from "next/head";
import { useMemo, useState } from "react";
import { FONTS, FONT_CATEGORIES, previewFontsUrl } from "../lib/fonts";

export const PAIRINGS = [
  ["Playfair Display", "Inter"],
  ["Space Grotesk", "DM Sans"],
  ["Bebas Neue", "Barlow"],
  ["Orbitron", "Exo 2"],
  ["Fraunces", "Work Sans"],
  ["Unbounded", "Outfit"],
  ["Instrument Serif", "Newsreader"],
  ["Press Start 2P", "VT323"],
  ["Permanent Marker", "Rubik"],
  ["Lilita One", "Fredoka"],
  ["Syne", "Manrope"],
  ["Anton", "Roboto"],
  ["DM Serif Display", "Lato"],
  ["Archivo Black", "Archivo"],
  ["Pacifico", "Quicksand"],
  ["JetBrains Mono", "IBM Plex Mono"],
];

export function FontPreviewSheet() {
  return (
    <Head>
      <link rel="stylesheet" href={previewFontsUrl()} />
    </Head>
  );
}

export default function FontPicker({ value, onChange, label }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FONTS.filter((font) => (category === "All" || font.category === category) && (!q || font.name.toLowerCase().includes(q)));
  }, [query, category]);

  return (
    <div className="font-picker">
      <div className="font-picker-head">
        <span className="field-label">{label}: <strong style={{ fontFamily: `"${value}"` }}>{value}</strong></span>
        <input type="search" placeholder={`Search ${FONTS.length} fonts…`} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="chip-row">
        {["All", ...FONT_CATEGORIES].map((name) => (
          <button key={name} type="button" className={`chip small ${category === name ? "active" : ""}`} onClick={() => setCategory(name)}>
            {name}
          </button>
        ))}
      </div>
      <div className="font-grid" role="listbox" aria-label={label}>
        {shown.map((font) => (
          <button
            key={font.name}
            type="button"
            role="option"
            aria-selected={value === font.name}
            className={`font-option ${value === font.name ? "active" : ""}`}
            style={{ fontFamily: `"${font.name}", system-ui` }}
            onClick={() => onChange(font.name)}
            title={`${font.name} · ${font.category} · ${font.weights.length > 1 ? `${font.weights[0]}–${font.weights.at(-1)}` : "one weight"}`}
          >
            {font.name}
          </button>
        ))}
        {!shown.length && <p className="muted small">No fonts match “{query}”.</p>}
      </div>
    </div>
  );
}
