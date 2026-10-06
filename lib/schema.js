// The shape of Dynamix's configuration: every option, its default, its allowed
// values, and how older config.json files map onto it. normalize() walks
// DEFAULTS, so a new option only needs a default here (plus a range or enum
// when it has one).
import { FONT_NAMES, findFont } from "./fonts";

/** The scene that shows only the now-playing card over the game. */
export const GAME_SCENE = "game";

export const PLATFORMS = {
  twitch: { name: "Twitch", icon: "twitch", url: "https://twitch.tv/{}" },
  youtube: { name: "YouTube", icon: "youtube", url: "https://youtube.com/@{}" },
  kick: { name: "Kick", icon: "kick", url: "https://kick.com/{}" },
  x: { name: "X", icon: "x", url: "https://x.com/{}" },
  bluesky: { name: "Bluesky", icon: "bluesky", url: "https://bsky.app/profile/{}" },
  instagram: { name: "Instagram", icon: "instagram", url: "https://instagram.com/{}" },
  tiktok: { name: "TikTok", icon: "tiktok", url: "https://tiktok.com/@{}" },
  discord: { name: "Discord", icon: "discord", url: "https://discord.gg/{}" },
  github: { name: "GitHub", icon: "github", url: "https://github.com/{}" },
  spotify: { name: "Spotify", icon: "spotify", url: "https://open.spotify.com/user/{}" },
  patreon: { name: "Patreon", icon: "patreon", url: "https://patreon.com/{}" },
  kofi: { name: "Ko-fi", icon: "kofi", url: "https://ko-fi.com/{}" },
  website: { name: "Website", icon: "", url: "{}" },
};

export const BUTTON_ACTIONS = {
  url: "Open a link",
  scene: "Switch scene",
  event: "Switch event",
  countdown: "Start countdown (minutes)",
  nowplaying: "Show/hide now playing",
  ticker: "Show/hide ticker",
  media: "Control desktop music",
};

/** What a "media" button sends to the desktop bridge. */
export const MEDIA_CONTROLS = { "play-pause": "Play / pause", next: "Next track", previous: "Previous track" };

/** Whole looks: colours, fonts and surface style. Picking one keeps everything else. */
export const THEME_PRESETS = {
  Midnight: { accent: "#E84B87", accent2: "#7C5CFF", background: "#111218", surface: "#1B1D27", text: "#F4F5FA", muted: "#9AA0B4", headingFont: "Quicksand", bodyFont: "Quicksand", cardStyle: "solid", backgroundType: "solid", pattern: "none" },
  Cheese: { accent: "#FFB224", accent2: "#FF6B3D", background: "#17130B", surface: "#231C10", text: "#FFF6E6", muted: "#C7B48F", headingFont: "Fredoka", bodyFont: "Nunito", cardStyle: "solid", backgroundType: "solid", pattern: "dots" },
  Ocean: { accent: "#38BDF8", accent2: "#2DD4BF", background: "#07131F", surface: "#0E2133", text: "#E8F4FF", muted: "#8FB1CC", headingFont: "Sora", bodyFont: "Inter", cardStyle: "glass", backgroundType: "gradient", pattern: "none" },
  Mint: { accent: "#5EE6D0", accent2: "#A3E635", background: "#070A12", surface: "#0E1422", text: "#E8ECF5", muted: "#A3AEC4", headingFont: "Space Grotesk", bodyFont: "DM Sans", cardStyle: "outline", backgroundType: "solid", pattern: "grid" },
  Paper: { accent: "#E5484D", accent2: "#1C1B19", background: "#F6F5F2", surface: "#FFFFFF", text: "#1C1B19", muted: "#6F6B65", headingFont: "Playfair Display", bodyFont: "Inter", cardStyle: "flat", backgroundType: "solid", pattern: "none" },
  Synthwave: { accent: "#FF2BD6", accent2: "#00E5FF", background: "#0D0221", surface: "#1A0B3B", text: "#FDF4FF", muted: "#B79CDB", headingFont: "Orbitron", bodyFont: "Exo 2", cardStyle: "neon", backgroundType: "gradient", pattern: "lines" },
  Arcade: { accent: "#FFE600", accent2: "#FF3B3B", background: "#000000", surface: "#141414", text: "#FFFFFF", muted: "#9C9C9C", headingFont: "Press Start 2P", bodyFont: "VT323", cardStyle: "outline", backgroundType: "solid", pattern: "grid" },
  Terminal: { accent: "#39FF14", accent2: "#00B37A", background: "#030A03", surface: "#0A160A", text: "#C8FFC0", muted: "#5FA35A", headingFont: "JetBrains Mono", bodyFont: "JetBrains Mono", cardStyle: "outline", backgroundType: "solid", pattern: "lines" },
  Sunset: { accent: "#FF7A45", accent2: "#FF3D77", background: "#1E0F1C", surface: "#2C1528", text: "#FFF1E8", muted: "#D7A9A0", headingFont: "Unbounded", bodyFont: "Outfit", cardStyle: "glass", backgroundType: "aurora", pattern: "none" },
  Forest: { accent: "#7BD389", accent2: "#E4C16F", background: "#0E1A12", surface: "#16261B", text: "#EEF6EA", muted: "#9DB5A0", headingFont: "Fraunces", bodyFont: "Work Sans", cardStyle: "solid", backgroundType: "solid", pattern: "noise" },
  Bubblegum: { accent: "#FF5FA2", accent2: "#7AD7FF", background: "#FFE8F3", surface: "#FFFFFF", text: "#3A1530", muted: "#9A6B88", headingFont: "Lilita One", bodyFont: "Fredoka", cardStyle: "solid", backgroundType: "gradient", pattern: "dots" },
  Lavender: { accent: "#A78BFA", accent2: "#F0ABFC", background: "#13111C", surface: "#1E1A2E", text: "#F3F0FF", muted: "#A9A2C4", headingFont: "Outfit", bodyFont: "Manrope", cardStyle: "glass", backgroundType: "aurora", pattern: "none" },
  Editorial: { accent: "#C2410C", accent2: "#0F172A", background: "#FAF7F0", surface: "#FFFDF8", text: "#1A1A1A", muted: "#6B6459", headingFont: "Instrument Serif", bodyFont: "Newsreader", cardStyle: "flat", backgroundType: "solid", pattern: "none" },
  Stadium: { accent: "#22C55E", accent2: "#FACC15", background: "#0A0F0B", surface: "#121A14", text: "#F5FFF7", muted: "#8EA894", headingFont: "Bebas Neue", bodyFont: "Barlow", cardStyle: "solid", backgroundType: "gradient", pattern: "lines" },
  Graffiti: { accent: "#F97316", accent2: "#06B6D4", background: "#18181B", surface: "#27272A", text: "#FAFAFA", muted: "#A1A1AA", headingFont: "Permanent Marker", bodyFont: "Rubik", cardStyle: "solid", backgroundType: "solid", pattern: "noise" },
};

export const DEFAULTS = {
  profile: {
    name: "Jordan",
    username: "xpbsh",
    tagline: "Creative coder & streamer",
    avatar: "https://avatars.githubusercontent.com/u/45247477",
    logo: "",
    team: {
      enabled: true,
      before: "We're",
      name: "Orangopus",
      desc: "An open collective that builds free open-source software for creators.",
    },
    socials: [
      { platform: "twitch", handle: "xpbsh", url: "" },
      { platform: "github", handle: "ORANGOPUS", url: "" },
      { platform: "discord", handle: "orangopus", url: "https://opus.ad/discord" },
    ],
  },
  theme: {
    preset: "Midnight",
    ...THEME_PRESETS.Midnight,
    headingWeight: 700,
    bodyWeight: 500,
    headingTransform: "none",
    headingSpacing: 0,
    fontScale: 100,
    radius: 18,
    borderWidth: 0,
    shadow: 40,
    gradientAngle: 135,
    backgroundImage: "",
    backgroundDim: 40,
    patternOpacity: 20,
    animation: "rise",
    customCss: "",
  },
  portfolio: {
    enabled: true,
    layout: "split",
    title: "Hey, I'm Jordan.",
    subtitle: "I create and design beautiful experiences for humans.",
    about: "",
    showAvatar: true,
    showSocials: true,
    heroImage: "heroimage.png",
    button: { text: "View my Dribbble", url: "https://dribbble.com" },
    links: [
      { label: "GitHub", url: "https://github.com/ORANGOPUS" },
      { label: "Website", url: "https://orangopus.github.io" },
    ],
    projects: [
      { title: "Dynamix Toolbox", desc: "Overlays, a stream deck and this page, all from one config.", image: "", url: "https://github.com/ORANGOPUS/dynamix-toolbox" },
    ],
    footer: "",
  },
  overlay: {
    enabled: true,
    layout: "classic",
    transparent: false,
    liveLabel: "live",
    currentScene: "start",
    currentEvent: "creative",
    showLogo: true,
    showSceneInfo: true,
    showEvent: true,
    scenes: [
      { id: "start", name: "Starting Soon", desc: "get ready for some bashing!", prenup: "Coming up…" },
      { id: "brb", name: "Bash Right Back", desc: "take 5. grab a snack. stretch your back!", prenup: "Coming up…" },
      { id: "end", name: "Goodbye", desc: "the code factory exploded!", prenup: "Show's over!" },
    ],
    events: [
      { id: "creative", name: "Creative Coding 🎨👨‍💻", desc: "Creative Coding is a segment on xpb.sh following xpbsh and his journey of creative and programmatic coding." },
      { id: "saturdev", name: "Saturdev 👨‍💻", desc: "Saturday is the day where Cheese develops cool stuff like Streamer.is and Dynamix." },
      { id: "sundev", name: "Sundev 👨‍💻", desc: "Sundev is the day where cheese gets to work on finishing up his to-do list and experiments with new projects." },
    ],
    nowPlaying: {
      enabled: true,
      // "manual" shows the fields below; "desktop" follows the music playing on
      // this computer through tools/dynamix-bridge, falling back to them.
      source: "manual",
      bridgeUrl: "http://127.0.0.1:7768",
      hideWhenPaused: false,
      showProgress: true,
      title: "Drive Time",
      artist: "Wynde Up",
      art: "",
      position: "bottom-left",
    },
    countdown: { enabled: true, label: "Starting in", target: "" },
    clock: { enabled: false, hour24: true },
    socials: { enabled: true },
    ticker: { enabled: false, text: "Welcome in! Grab a drink, say hi in chat, and don't forget to follow ✨", speed: 40 },
  },
  go: {
    enabled: true,
    columns: 4,
    buttonStyle: "tinted",
    showLabels: true,
    showSceneRow: true,
    showEventRow: false,
    showNowPlaying: true,
    buttons: [
      { id: "b1", icon: "🎬", label: "Starting", color: "#E84B87", action: "scene", value: "start" },
      { id: "b2", icon: "☕", label: "Be right back", color: "#FFB224", action: "scene", value: "brb" },
      { id: "b3", icon: "🎮", label: "Game", color: "#22C55E", action: "scene", value: GAME_SCENE },
      { id: "b4", icon: "👋", label: "Ending", color: "#38BDF8", action: "scene", value: "end" },
      { id: "b5", icon: "⏱️", label: "5 min timer", color: "#A78BFA", action: "countdown", value: "5" },
      { id: "b6", icon: "🎵", label: "Music card", color: "#5EE6D0", action: "nowplaying", value: "" },
      { id: "b7", icon: "📣", label: "Ticker", color: "#FF7A45", action: "ticker", value: "" },
      { id: "b8", icon: "⏯️", label: "Play / pause", color: "#22D3EE", action: "media", value: "play-pause" },
      { id: "b9", icon: "⏭️", label: "Next track", color: "#38BDF8", action: "media", value: "next" },
      { id: "b10", icon: "🥨", label: "Pretzel", color: "#F97316", action: "url", value: "https://www.pretzel.rocks" },
    ],
  },
};

const ENUMS = {
  "theme.preset": [...Object.keys(THEME_PRESETS), "Custom"],
  "theme.headingFont": FONT_NAMES,
  "theme.bodyFont": FONT_NAMES,
  "theme.headingTransform": ["none", "uppercase", "lowercase", "capitalize"],
  "theme.cardStyle": ["solid", "glass", "outline", "neon", "flat"],
  "theme.backgroundType": ["solid", "gradient", "aurora", "image"],
  "theme.pattern": ["none", "dots", "grid", "lines", "noise"],
  "theme.animation": ["none", "fade", "rise", "slide", "pop"],
  "profile.socials.platform": Object.keys(PLATFORMS),
  "portfolio.layout": ["split", "centered", "card"],
  "overlay.layout": ["classic", "centered", "minimal", "lowerthird"],
  "overlay.nowPlaying.source": ["manual", "desktop"],
  "overlay.nowPlaying.position": ["bottom-left", "bottom-right", "top-left", "top-right"],
  "go.buttonStyle": ["tinted", "solid", "outline"],
  "go.buttons.action": Object.keys(BUTTON_ACTIONS),
};

export const RANGES = {
  "theme.headingWeight": [100, 900],
  "theme.bodyWeight": [100, 900],
  "theme.headingSpacing": [-10, 30],
  "theme.fontScale": [70, 160],
  "theme.radius": [0, 48],
  "theme.borderWidth": [0, 8],
  "theme.shadow": [0, 100],
  "theme.gradientAngle": [0, 360],
  "theme.backgroundDim": [0, 90],
  "theme.patternOpacity": [0, 100],
  "overlay.ticker.speed": [10, 120],
  "go.columns": [2, 8],
};

const LIST_MAX = {
  "profile.socials": 16,
  "portfolio.links": 12,
  "portfolio.projects": 24,
  "overlay.scenes": 20,
  "overlay.events": 20,
  "go.buttons": 48,
};

const LONG_TEXT = { "theme.customCss": 20000 };

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
const slug = (value, index) =>
  (typeof value === "string" && value.trim() ? value : `item-${index + 1}`).toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 40);
const isColor = (value) => typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value);

/** A list's first item with its free text emptied: what a missing field in another item falls back to. */
function blankItem(item, path) {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [key, typeof value === "string" && !isColor(value) && !ENUMS[`${path}.${key}`] ? "" : value]),
  );
}

/** Coerce `value` to the shape of `fallback`, recursively. `path` names it in ENUMS/RANGES. */
function coerce(value, fallback, path) {
  if (Array.isArray(fallback)) {
    if (!Array.isArray(value)) return fallback;
    const template = blankItem(fallback[0] ?? {}, path);
    return value.filter(isObject).slice(0, LIST_MAX[path] ?? 50).map((item) => coerce(item, template, path));
  }
  if (isObject(fallback)) {
    const source = isObject(value) ? value : {};
    return Object.fromEntries(Object.entries(fallback).map(([key, inner]) => [key, coerce(source[key], inner, `${path}.${key}`.replace(/^\./, ""))]));
  }
  if (ENUMS[path]) return ENUMS[path].includes(value) ? value : fallback;
  if (typeof fallback === "boolean") return typeof value === "boolean" ? value : fallback;
  if (typeof fallback === "number") {
    const [min, max] = RANGES[path] ?? [-Infinity, Infinity];
    const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
    return typeof number === "number" && Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
  }
  if (isColor(fallback)) return isColor(value) ? value : fallback;
  return typeof value === "string" ? value.slice(0, LONG_TEXT[path] ?? 2000) : fallback;
}

/** The nearest weight the font really has, so the browser never fakes bold. */
function nearestWeight(font, weight) {
  return findFont(font).weights.reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best));
}

/** The first config.json shape (2020), mapped onto this one. */
function fromLegacy(old) {
  const user = old.user ?? {};
  const web = old.web ?? {};
  const sceneIds = { start: true, brb: true, end: true };
  return {
    profile: { name: user.username, username: user.username, avatar: user.avatar, logo: user.logo, team: old.team },
    theme: {
      preset: "Custom",
      accent: web.mainbutton?.background,
      background: user.background,
      text: user.color,
      headingFont: user.font,
      bodyFont: user.font,
      backgroundImage: user.backgroundImage?.enabled ? user.backgroundImage.url : "",
      backgroundType: user.backgroundImage?.enabled && user.backgroundImage.url ? "image" : "solid",
    },
    portfolio: { title: web.title, subtitle: web.subtitle, button: { text: web.mainbutton?.text, url: web.link } },
    overlay: {
      liveLabel: old.logo?.live,
      currentScene: user.currentScene,
      scenes: (old.scenes ?? []).filter((s) => sceneIds[s.id]),
      events: (old.events ?? []).map((e, i) => ({ ...e, id: slug(e.name, i) })),
    },
  };
}

/** The first static-site shape (one font, URL-only buttons), mapped onto this one. */
function fromV1(raw) {
  const theme = { ...raw.theme };
  if (theme.font && !theme.headingFont) {
    theme.headingFont = theme.font;
    theme.bodyFont = theme.font;
    theme.preset = "Custom";
  }
  const go = isObject(raw.go) ? { ...raw.go } : raw.go;
  if (Array.isArray(go?.buttons)) {
    go.buttons = go.buttons.map((b) => (isObject(b) && !b.action ? { ...b, action: "url", value: b.url ?? "" } : b));
  }
  return { ...raw, theme, go };
}

/** Any input (the saved config, a share link, an old config.json) as a complete, valid config. */
export function normalize(input) {
  let raw = isObject(input) ? input : {};
  if (raw.user && !raw.profile) raw = fromLegacy(raw);
  if (isObject(raw.theme) && "font" in raw.theme) raw = fromV1(raw);
  const config = coerce(raw, DEFAULTS, "");

  const { theme, overlay, go } = config;
  theme.headingWeight = nearestWeight(theme.headingFont, theme.headingWeight);
  theme.bodyWeight = nearestWeight(theme.bodyFont, theme.bodyWeight);

  overlay.scenes = overlay.scenes.map((s, i) => ({ ...s, id: slug(s.id || s.name, i) }));
  overlay.events = overlay.events.map((e, i) => ({ ...e, id: slug(e.id || e.name, i) }));
  const sceneIds = [...overlay.scenes.map((s) => s.id), GAME_SCENE];
  if (!sceneIds.includes(overlay.currentScene)) overlay.currentScene = sceneIds[0];
  if (!overlay.events.some((e) => e.id === overlay.currentEvent)) overlay.currentEvent = overlay.events[0]?.id ?? "";
  go.buttons = go.buttons.map((b, i) => ({ ...b, id: slug(b.id, i), icon: b.icon.slice(0, 8) }));
  return config;
}

/** Set `value` at a dotted path ("overlay.scenes.0.name") without mutating `object`. */
export function setIn(object, path, value) {
  const [key, ...rest] = path.split(".");
  const target = Array.isArray(object) ? [...object] : { ...object };
  target[key] = rest.length ? setIn(object?.[key] ?? {}, rest.join("."), value) : value;
  return target;
}

export const getIn = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);

/** The link a social entry points at. */
export function socialUrl({ platform, handle, url }) {
  if (url) return url;
  const template = PLATFORMS[platform]?.url ?? "{}";
  return template.replace("{}", handle.replace(/^@/, ""));
}
