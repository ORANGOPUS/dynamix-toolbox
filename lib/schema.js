// The shape of Dynamix's configuration: every option, its default, and how an
// older config.json maps onto it.

export const FONTS = ["Quicksand", "Inter", "Space Grotesk", "Sora", "Poppins", "DM Sans", "JetBrains Mono"];

export const THEME_PRESETS = {
  Midnight: { accent: "#E84B87", background: "#111218", surface: "#1B1D27", text: "#F4F5FA", muted: "#9AA0B4" },
  Cheese: { accent: "#FFB224", background: "#17130B", surface: "#231C10", text: "#FFF6E6", muted: "#C7B48F" },
  Ocean: { accent: "#38BDF8", background: "#07131F", surface: "#0E2133", text: "#E8F4FF", muted: "#8FB1CC" },
  Mint: { accent: "#5EE6D0", background: "#070A12", surface: "#0E1422", text: "#E8ECF5", muted: "#A3AEC4" },
  Paper: { accent: "#E5484D", background: "#F6F5F2", surface: "#FFFFFF", text: "#1C1B19", muted: "#6F6B65" },
};

export const DEFAULTS = {
  profile: {
    name: "Jordan",
    username: "xpbsh",
    avatar: "https://avatars2.githubusercontent.com/u/45247477",
    logo: "",
    team: {
      enabled: true,
      before: "We're",
      name: "Orangopus",
      desc: "An open collective that builds free open-source software for creators.",
    },
  },
  theme: {
    ...THEME_PRESETS.Midnight,
    font: "Quicksand",
    radius: 18,
    backgroundImage: "",
  },
  portfolio: {
    enabled: true,
    title: "Hey, I'm Jordan.",
    subtitle: "I create and design beautiful experiences for humans.",
    button: { text: "View my Dribbble", url: "https://dribbble.com" },
    links: [
      { label: "GitHub", url: "https://github.com/ORANGOPUS" },
      { label: "Website", url: "https://orangop.us" },
    ],
  },
  overlay: {
    enabled: true,
    liveLabel: "live",
    currentScene: "start",
    currentEvent: "creative",
    transparent: false,
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
    nowPlaying: { enabled: true, title: "Drive Time", artist: "Wynde Up", art: "" },
  },
  go: {
    enabled: true,
    columns: 4,
    showNowPlaying: true,
    buttons: [
      { id: "b1", icon: "🎬", label: "Starting", url: "", color: "#E84B87" },
      { id: "b2", icon: "☕", label: "Be right back", url: "", color: "#FFB224" },
      { id: "b3", icon: "👋", label: "Ending", url: "", color: "#38BDF8" },
      { id: "b4", icon: "🎵", label: "Music", url: "https://www.pretzel.rocks", color: "#5EE6D0" },
    ],
  },
};

/** The scene that shows only the now-playing card over the game. */
export const GAME_SCENE = "game";

const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
const str = (value, fallback) => (typeof value === "string" ? value.slice(0, 2000) : fallback);
const bool = (value, fallback) => (typeof value === "boolean" ? value : fallback);
const num = (value, fallback, min, max) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
const color = (value, fallback) => (typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : fallback);
const slug = (value, index) =>
  (typeof value === "string" && value.trim() ? value : `item-${index + 1}`).toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 40);
const list = (value, fallback, item, max = 50) =>
  Array.isArray(value) ? value.filter(isObject).slice(0, max).map(item) : fallback;

/** The pre-panel config.json shape, mapped onto this one. */
function fromLegacy(old) {
  const user = old.user ?? {};
  const web = old.web ?? {};
  const sceneIds = { start: true, brb: true, end: true };
  return {
    profile: {
      name: user.username,
      username: user.username,
      avatar: user.avatar,
      logo: user.logo,
      team: old.team,
    },
    theme: {
      accent: web.mainbutton?.background,
      background: user.background,
      text: user.color,
      font: user.font,
      backgroundImage: user.backgroundImage?.enabled ? user.backgroundImage.url : "",
    },
    portfolio: {
      title: web.title,
      subtitle: web.subtitle,
      button: { text: web.mainbutton?.text, url: web.link },
    },
    overlay: {
      liveLabel: old.logo?.live,
      currentScene: user.currentScene,
      scenes: (old.scenes ?? []).filter((s) => sceneIds[s.id]),
      events: (old.events ?? []).map((e, i) => ({ ...e, id: slug(e.name, i) })),
      currentEvent: undefined,
    },
  };
}

/** Any input (the saved file, a save from the panel, an old config.json) as a complete, valid config. */
export function normalize(input) {
  let raw = isObject(input) ? input : {};
  if (raw.user && !raw.profile) raw = fromLegacy(raw);
  const d = DEFAULTS;
  const p = isObject(raw.profile) ? raw.profile : {};
  const team = isObject(p.team) ? p.team : {};
  const t = isObject(raw.theme) ? raw.theme : {};
  const pf = isObject(raw.portfolio) ? raw.portfolio : {};
  const o = isObject(raw.overlay) ? raw.overlay : {};
  const np = isObject(o.nowPlaying) ? o.nowPlaying : {};
  const g = isObject(raw.go) ? raw.go : {};

  const scenes = list(o.scenes, d.overlay.scenes, (s, i) => ({
    id: slug(s.id, i),
    name: str(s.name, ""),
    desc: str(s.desc, ""),
    prenup: str(s.prenup, ""),
  }), 20);
  const events = list(o.events, d.overlay.events, (e, i) => ({ id: slug(e.id ?? e.name, i), name: str(e.name, ""), desc: str(e.desc, "") }), 20);
  const sceneIds = [...scenes.map((s) => s.id), GAME_SCENE];

  return {
    profile: {
      name: str(p.name, d.profile.name),
      username: str(p.username, d.profile.username),
      avatar: str(p.avatar, d.profile.avatar),
      logo: str(p.logo, d.profile.logo),
      team: {
        enabled: bool(team.enabled, d.profile.team.enabled),
        before: str(team.before, d.profile.team.before).trim(),
        name: str(team.name, d.profile.team.name),
        desc: str(team.desc, d.profile.team.desc),
      },
    },
    theme: {
      accent: color(t.accent, d.theme.accent),
      background: color(t.background, d.theme.background),
      surface: color(t.surface, d.theme.surface),
      text: color(t.text, d.theme.text),
      muted: color(t.muted, d.theme.muted),
      font: FONTS.includes(t.font) ? t.font : d.theme.font,
      radius: num(t.radius, d.theme.radius, 0, 40),
      backgroundImage: str(t.backgroundImage, d.theme.backgroundImage),
    },
    portfolio: {
      enabled: bool(pf.enabled, d.portfolio.enabled),
      title: str(pf.title, d.portfolio.title),
      subtitle: str(pf.subtitle, d.portfolio.subtitle),
      button: {
        text: str(pf.button?.text, d.portfolio.button.text),
        url: str(pf.button?.url, d.portfolio.button.url),
      },
      links: list(pf.links, d.portfolio.links, (l) => ({ label: str(l.label, ""), url: str(l.url, "") }), 12),
    },
    overlay: {
      enabled: bool(o.enabled, d.overlay.enabled),
      liveLabel: str(o.liveLabel, d.overlay.liveLabel),
      currentScene: sceneIds.includes(o.currentScene) ? o.currentScene : sceneIds[0],
      currentEvent: events.some((e) => e.id === o.currentEvent) ? o.currentEvent : events[0]?.id ?? "",
      transparent: bool(o.transparent, d.overlay.transparent),
      scenes,
      events,
      nowPlaying: {
        enabled: bool(np.enabled, d.overlay.nowPlaying.enabled),
        title: str(np.title, d.overlay.nowPlaying.title),
        artist: str(np.artist, d.overlay.nowPlaying.artist),
        art: str(np.art, d.overlay.nowPlaying.art),
      },
    },
    go: {
      enabled: bool(g.enabled, d.go.enabled),
      columns: num(g.columns, d.go.columns, 2, 6),
      showNowPlaying: bool(g.showNowPlaying, d.go.showNowPlaying),
      buttons: list(g.buttons, d.go.buttons, (b, i) => ({
        id: slug(b.id, i),
        icon: str(b.icon, "").slice(0, 8),
        label: str(b.label, ""),
        url: str(b.url, ""),
        color: color(b.color, d.theme.accent),
      }), 32),
    },
  };
}

/** Set `value` at a dotted path ("overlay.scenes.0.name") without mutating `object`. */
export function setIn(object, path, value) {
  const [key, ...rest] = path.split(".");
  const target = Array.isArray(object) ? [...object] : { ...object };
  target[key] = rest.length ? setIn(object?.[key] ?? {}, rest.join("."), value) : value;
  return target;
}
