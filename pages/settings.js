// The customisation studio. Every change saves in this browser straight away
// and shows live in the preview and on any other Dynamix page open here.
// Undo/redo, saved setups, share links and JSON export cover the rest.
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColorInput, CopyButton, Field, ListEditor, Range, Section, Segmented, Select, TextInput, Toggle } from "../components/Fields";
import FontPicker, { FontPreviewSheet, PAIRINGS } from "../components/FontPicker";
import Theme from "../components/Theme";
import { BUILT_IN, isShared, loadConfig, resetConfig, saveConfig, shareLink } from "../lib/config";
import { FONTS, findFont } from "../lib/fonts";
import { useDesktopTrack } from "../lib/desktop";
import { addToLibrary, loadLibrary, removeFromLibrary } from "../lib/library";
import { BUTTON_ACTIONS, GAME_SCENE, MEDIA_CONTROLS, PLATFORMS, THEME_PRESETS, getIn, normalize, setIn } from "../lib/schema";

const TABS = [
  ["look", "🎨", "Look"],
  ["type", "🔤", "Typography"],
  ["profile", "👤", "Profile"],
  ["portfolio", "🖼️", "Portfolio"],
  ["overlay", "📺", "Overlay"],
  ["go", "🎛️", "GoDECK"],
  ["library", "📚", "Saved setups"],
  ["share", "🔗", "Share & backup"],
  ["advanced", "🧪", "Advanced"],
];

const PREVIEWS = {
  overlay: { src: "../overlays/", width: 1920, height: 1080, name: "Overlay" },
  portfolio: { src: "../", width: 1280, height: 800, name: "Portfolio" },
  go: { src: "../go/", width: 820, height: 1000, name: "GoDECK" },
};
const TAB_PREVIEW = { portfolio: "portfolio", go: "go", overlay: "overlay", profile: "portfolio" };

// Theme keys a preset sets; editing one by hand makes the theme "Custom".
const PRESET_KEYS = new Set(Object.keys(THEME_PRESETS.Midnight));

const BRIDGE_INSTALL =
  "mkdir -p ~/.local/bin && curl -fsSL https://raw.githubusercontent.com/ORANGOPUS/dynamix-toolbox/master/tools/dynamix-bridge -o ~/.local/bin/dynamix-bridge && chmod +x ~/.local/bin/dynamix-bridge";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const BRIDGE_AUTOSTART = 'o.launch_on_start("dynamix-bridge")';

function bridgeStatus(desktop, url) {
  if (desktop.status === "connecting") return ["pending", "Connecting to the bridge…"];
  if (desktop.status === "offline") return ["offline", `Can't reach the bridge at ${url}: it isn't running, or the browser blocked it (see below). Until then, the song typed in below shows.`];
  const track = desktop.track;
  if (!track) return ["online", "Connected · nothing is playing right now"];
  return ["online", `Connected · ${track.player}: ${track.title}${track.artist ? ` by ${track.artist}` : ""} (${track.status.toLowerCase()})`];
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** ISO time ↔ the value a datetime-local input wants (local time, no zone). */
const toLocalInput = (iso) => {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "";
  const date = new Date(time - new Date().getTimezoneOffset() * 60000);
  return date.toISOString().slice(0, 16);
};

function Preview({ kind }) {
  const box = useRef(null);
  const [width, setWidth] = useState(400);
  const { src, width: pageWidth, height } = PREVIEWS[kind];
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);
  const scale = width / pageWidth;
  return (
    <div className={`preview preview-${kind}`} ref={box} style={{ height: height * scale }}>
      <iframe title={`${PREVIEWS[kind].name} preview`} src={src} style={{ width: pageWidth, height, transform: `scale(${scale})` }} />
    </div>
  );
}

/** Colour swatches and fonts of a config, for preset and saved-setup cards. */
function Swatch({ theme }) {
  return (
    <span className="swatch" style={{ background: theme.background, color: theme.text, borderColor: theme.accent }}>
      <span className="swatch-dots">
        {[theme.accent, theme.accent2, theme.surface].map((color, i) => <i key={i} style={{ background: color }} />)}
      </span>
      <span style={{ fontFamily: `"${theme.headingFont}"` }}>Aa</span>
    </span>
  );
}

export default function Settings() {
  const [config, setConfig] = useState(BUILT_IN);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const lastEdit = useRef({ path: "", time: 0 });
  const [tab, setTab] = useState("look");
  const [previewKind, setPreviewKind] = useState("overlay");
  const [status, setStatus] = useState("");
  const [fontTarget, setFontTarget] = useState("headingFont");
  const [library, setLibrary] = useState([]);
  const [setupName, setSetupName] = useState("");
  const [json, setJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  const fileInput = useRef(null);
  const desktop = useDesktopTrack(config.overlay.nowPlaying);

  useEffect(() => {
    // A share link opened here becomes this browser's config, then the hash goes.
    const loaded = loadConfig();
    if (isShared()) {
      saveConfig(loaded);
      history.replaceState(null, "", window.location.pathname + window.location.search);
      setStatus("Loaded the config from the share link");
    }
    setConfig(loaded);
    setLibrary(loadLibrary());
    const fromHash = window.location.hash.replace("#", "");
    if (TABS.some(([id]) => id === fromHash)) setTab(fromHash);
  }, []);

  useEffect(() => {
    if (TAB_PREVIEW[tab]) setPreviewKind(TAB_PREVIEW[tab]);
  }, [tab]);

  const pretty = useMemo(() => JSON.stringify(config, null, 2), [config]);
  useEffect(() => {
    setJson(pretty);
    setJsonError("");
  }, [pretty]);

  /** Save a whole new config. Quick edits to the same field share one undo step. */
  const commit = useCallback(
    (next, path = "*") => {
      const saved = saveConfig(next);
      const now = Date.now();
      const sameBurst = path !== "*" && lastEdit.current.path === path && now - lastEdit.current.time < 800;
      if (!sameBurst) setPast((list) => [...list.slice(-99), config]);
      lastEdit.current = { path, time: now };
      setFuture([]);
      setConfig(saved);
      setStatus(`Saved · ${new Date().toLocaleTimeString()}`);
    },
    [config],
  );

  const set = (path, value) => {
    let next = setIn(config, path, value);
    const [root, key] = path.split(".");
    if (root === "theme" && PRESET_KEYS.has(key)) next = setIn(next, "theme.preset", "Custom");
    commit(next, path);
  };
  const val = (path) => getIn(config, path);

  const undo = useCallback(() => {
    if (!past.length) return;
    const previous = past.at(-1);
    setPast(past.slice(0, -1));
    setFuture([config, ...future]);
    setConfig(saveConfig(previous));
    lastEdit.current = { path: "", time: 0 };
    setStatus("Undone");
  }, [past, future, config]);

  const redo = useCallback(() => {
    if (!future.length) return;
    const [next, ...rest] = future;
    setFuture(rest);
    setPast([...past, config]);
    setConfig(saveConfig(next));
    lastEdit.current = { path: "", time: 0 };
    setStatus("Redone");
  }, [past, future, config]);

  useEffect(() => {
    const onKey = (event) => {
      if (!(event.ctrlKey || event.metaKey) || event.target.closest("input, textarea, select")) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) undo();
      else if ((key === "z" && event.shiftKey) || key === "y") redo();
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const applyPreset = (name) => commit({ ...config, theme: { ...config.theme, ...THEME_PRESETS[name], preset: name } });

  const surprise = () => {
    const name = pick(Object.keys(THEME_PRESETS));
    const [headingFont, bodyFont] = pick(PAIRINGS);
    commit({
      ...config,
      theme: {
        ...config.theme,
        ...THEME_PRESETS[name],
        preset: "Custom",
        headingFont,
        bodyFont,
        radius: pick([0, 8, 14, 18, 24, 32]),
        cardStyle: pick(["solid", "glass", "outline", "neon", "flat"]),
        backgroundType: pick(["solid", "gradient", "aurora"]),
        pattern: pick(["none", "none", "dots", "grid", "lines", "noise"]),
        gradientAngle: pick([90, 135, 160, 200, 315]),
        headingTransform: pick(["none", "none", "uppercase"]),
        animation: pick(["fade", "rise", "slide", "pop"]),
      },
    });
    setStatus(`Surprise: ${name} colours with ${headingFont} + ${bodyFont}`);
  };

  const applyJson = () => {
    try {
      commit(JSON.parse(json));
      setJsonError("");
    } catch (error) {
      setJsonError(`Not valid JSON: ${error.message}`);
    }
  };

  const exportJson = () => {
    const blob = new Blob([pretty + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: "config.json" }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importJson = async (file) => {
    try {
      commit(normalize(JSON.parse(await file.text())));
      setStatus(`Imported ${file.name}`);
    } catch (error) {
      setStatus(`Couldn't import ${file.name}: ${error.message}`);
    }
  };

  const { profile, theme, portfolio, overlay, go } = config;
  const sceneOptions = [...overlay.scenes.map((s) => [s.id, s.name]), [GAME_SCENE, "Game (song only)"]];
  const eventOptions = overlay.events.map((e) => [e.id, e.name]);
  const weightOptions = (font) => findFont(font).weights.map((w) => [w, String(w)]);
  const setNumber = (path) => (value) => set(path, Number(value));

  const panels = {
    look: (
      <>
        <Section
          title="Presets"
          description="Each preset sets colours, fonts and surfaces. Everything else stays as it is."
          actions={<button type="button" className="button small" onClick={surprise}>🎲 Surprise me</button>}
        >
          <div className="preset-grid">
            {Object.entries(THEME_PRESETS).map(([name, preset]) => (
              <button type="button" key={name} className={`preset-card ${theme.preset === name ? "active" : ""}`} onClick={() => applyPreset(name)}>
                <Swatch theme={preset} />
                <span className="preset-name">{name}</span>
              </button>
            ))}
          </div>
        </Section>
        <Section title="Colours">
          <div className="grid-3">
            <ColorInput label="Accent" value={theme.accent} onChange={(v) => set("theme.accent", v)} />
            <ColorInput label="Second accent" value={theme.accent2} onChange={(v) => set("theme.accent2", v)} />
            <ColorInput label="Background" value={theme.background} onChange={(v) => set("theme.background", v)} />
            <ColorInput label="Cards" value={theme.surface} onChange={(v) => set("theme.surface", v)} />
            <ColorInput label="Text" value={theme.text} onChange={(v) => set("theme.text", v)} />
            <ColorInput label="Muted text" value={theme.muted} onChange={(v) => set("theme.muted", v)} />
          </div>
        </Section>
        <Section title="Background">
          <Segmented label="Type" value={theme.backgroundType} options={[["solid", "Solid"], ["gradient", "Gradient"], ["aurora", "Aurora"], ["image", "Image"]]} onChange={(v) => set("theme.backgroundType", v)} />
          <div className="grid-3">
            {theme.backgroundType === "gradient" && <Range label="Gradient angle" value={theme.gradientAngle} min={0} max={360} unit="°" onChange={(v) => set("theme.gradientAngle", v)} />}
            {theme.backgroundType === "image" && (
              <>
                <Field label="Image URL" wide><TextInput value={theme.backgroundImage} onChange={(v) => set("theme.backgroundImage", v)} placeholder="https://…" /></Field>
                <Range label="Darken" value={theme.backgroundDim} min={0} max={90} unit="%" onChange={(v) => set("theme.backgroundDim", v)} />
              </>
            )}
          </div>
          <Segmented label="Pattern" value={theme.pattern} options={["none", "dots", "grid", "lines", "noise"]} onChange={(v) => set("theme.pattern", v)} />
          {theme.pattern !== "none" && <Range label="Pattern strength" value={theme.patternOpacity} min={0} max={100} unit="%" onChange={(v) => set("theme.patternOpacity", v)} />}
        </Section>
        <Section title="Cards & shapes">
          <Segmented label="Card style" value={theme.cardStyle} options={[["solid", "Solid"], ["glass", "Glass"], ["outline", "Outline"], ["neon", "Neon"], ["flat", "Flat"]]} onChange={(v) => set("theme.cardStyle", v)} />
          <div className="grid-3">
            <Range label="Corner radius" value={theme.radius} min={0} max={48} unit="px" onChange={(v) => set("theme.radius", v)} />
            <Range label="Border" value={theme.borderWidth} min={0} max={8} unit="px" onChange={(v) => set("theme.borderWidth", v)} />
            <Range label="Shadow" value={theme.shadow} min={0} max={100} unit="%" onChange={(v) => set("theme.shadow", v)} />
          </div>
          <Segmented label="Entrance animation" value={theme.animation} options={["none", "fade", "rise", "slide", "pop"]} onChange={(v) => set("theme.animation", v)} />
        </Section>
      </>
    ),

    type: (
      <>
        <Section title="Font pairings" description="One click sets the heading and body fonts together.">
          <div className="pairing-grid">
            {PAIRINGS.map(([heading, body]) => (
              <button
                type="button"
                key={heading + body}
                className={`pairing ${theme.headingFont === heading && theme.bodyFont === body ? "active" : ""}`}
                onClick={() => commit({ ...config, theme: { ...theme, headingFont: heading, bodyFont: body, preset: "Custom" } })}
              >
                <span className="pairing-heading" style={{ fontFamily: `"${heading}"` }}>{heading}</span>
                <span className="pairing-body muted" style={{ fontFamily: `"${body}"` }}>with {body}</span>
              </button>
            ))}
          </div>
        </Section>
        <Section title={`All fonts (${FONTS.length})`}>
          <Segmented label="Choosing the font for" value={fontTarget} options={[["headingFont", "Headings"], ["bodyFont", "Body text"]]} onChange={setFontTarget} />
          <FontPicker
            label={fontTarget === "headingFont" ? "Headings" : "Body text"}
            value={theme[fontTarget]}
            onChange={(name) => set(`theme.${fontTarget}`, name)}
          />
        </Section>
        <Section title="Fine-tuning">
          <div className="type-sample" style={{ "--h": `"${theme.headingFont}"`, "--b": `"${theme.bodyFont}"` }}>
            <div style={{ fontFamily: "var(--h)", fontWeight: theme.headingWeight, textTransform: theme.headingTransform, letterSpacing: `${theme.headingSpacing / 100}em` }}>
              Starting soon
            </div>
            <p style={{ fontFamily: "var(--b)", fontWeight: theme.bodyWeight }}>Grab a snack, the stream starts in a few minutes. 0123456789</p>
          </div>
          <div className="grid-3">
            <Select label="Heading weight" value={theme.headingWeight} options={weightOptions(theme.headingFont)} onChange={setNumber("theme.headingWeight")} />
            <Select label="Body weight" value={theme.bodyWeight} options={weightOptions(theme.bodyFont)} onChange={setNumber("theme.bodyWeight")} />
            <Range label="Text size" value={theme.fontScale} min={70} max={160} unit="%" onChange={(v) => set("theme.fontScale", v)} />
            <Range label="Heading letter spacing" value={theme.headingSpacing} min={-10} max={30} onChange={(v) => set("theme.headingSpacing", v)} />
          </div>
          <Segmented label="Heading case" value={theme.headingTransform} options={[["none", "As typed"], ["uppercase", "UPPER"], ["lowercase", "lower"], ["capitalize", "Title"]]} onChange={(v) => set("theme.headingTransform", v)} />
        </Section>
      </>
    ),

    profile: (
      <>
        <Section title="You">
          <div className="grid-2">
            <Field label="Name"><TextInput value={profile.name} onChange={(v) => set("profile.name", v)} /></Field>
            <Field label="Username"><TextInput value={profile.username} onChange={(v) => set("profile.username", v)} /></Field>
            <Field label="Tagline"><TextInput value={profile.tagline} onChange={(v) => set("profile.tagline", v)} /></Field>
            <Field label="Avatar URL"><TextInput value={profile.avatar} onChange={(v) => set("profile.avatar", v)} /></Field>
            <Field label="Logo URL" hint="Leave empty to show your username instead."><TextInput value={profile.logo} onChange={(v) => set("profile.logo", v)} /></Field>
          </div>
        </Section>
        <Section title="Socials" description="Shown on the portfolio and along the bottom of the overlay.">
          <ListEditor
            items={profile.socials}
            fields={[
              { key: "platform", label: "Platform", type: "select", options: Object.entries(PLATFORMS).map(([id, p]) => [id, p.name]) },
              { key: "handle", label: "Handle" },
              { key: "url", label: "Link (optional)", placeholder: "Worked out from the handle", wide: true },
            ]}
            onChange={(socials) => set("profile.socials", socials)}
            make={() => ({ platform: "youtube", handle: profile.username, url: "" })}
            addLabel="Add social"
          />
        </Section>
        <Section title="Team">
          <Toggle label="Show your team" checked={profile.team.enabled} onChange={(v) => set("profile.team.enabled", v)} />
          {profile.team.enabled && (
            <div className="grid-2">
              <Field label="Before the name"><TextInput value={profile.team.before} onChange={(v) => set("profile.team.before", v)} /></Field>
              <Field label="Team name"><TextInput value={profile.team.name} onChange={(v) => set("profile.team.name", v)} /></Field>
              <Field label="Team description" wide><TextInput multiline value={profile.team.desc} onChange={(v) => set("profile.team.desc", v)} /></Field>
            </div>
          )}
        </Section>
      </>
    ),

    portfolio: (
      <>
        <Section title="Page">
          <Toggle label="Show the portfolio page" checked={portfolio.enabled} onChange={(v) => set("portfolio.enabled", v)} />
          <Segmented label="Layout" value={portfolio.layout} options={[["split", "Split"], ["centered", "Centred"], ["card", "Card"]]} onChange={(v) => set("portfolio.layout", v)} />
          <div className="grid-2">
            <Field label="Title"><TextInput value={portfolio.title} onChange={(v) => set("portfolio.title", v)} /></Field>
            <Field label="Subtitle"><TextInput value={portfolio.subtitle} onChange={(v) => set("portfolio.subtitle", v)} /></Field>
            <Field label="Button text"><TextInput value={portfolio.button.text} onChange={(v) => set("portfolio.button.text", v)} /></Field>
            <Field label="Button link"><TextInput value={portfolio.button.url} onChange={(v) => set("portfolio.button.url", v)} /></Field>
            <Field label="Hero image URL" hint="Empty hides it. Not shown in the centred layout."><TextInput value={portfolio.heroImage} onChange={(v) => set("portfolio.heroImage", v)} /></Field>
            <Field label="Footer note"><TextInput value={portfolio.footer} onChange={(v) => set("portfolio.footer", v)} /></Field>
            <Field label="About" hint="Blank lines start new paragraphs. Empty hides the section." wide><TextInput multiline rows={4} value={portfolio.about} onChange={(v) => set("portfolio.about", v)} /></Field>
          </div>
          <div className="toggle-row">
            <Toggle label="Show avatar" checked={portfolio.showAvatar} onChange={(v) => set("portfolio.showAvatar", v)} />
            <Toggle label="Show socials" checked={portfolio.showSocials} onChange={(v) => set("portfolio.showSocials", v)} />
          </div>
        </Section>
        <Section title="Links">
          <ListEditor
            items={portfolio.links}
            fields={[{ key: "label", label: "Label" }, { key: "url", label: "URL", wide: true }]}
            onChange={(links) => set("portfolio.links", links)}
            make={() => ({ label: "New link", url: "https://" })}
            addLabel="Add link"
          />
        </Section>
        <Section title="Projects">
          <ListEditor
            items={portfolio.projects}
            fields={[
              { key: "title", label: "Title" },
              { key: "url", label: "Link" },
              { key: "image", label: "Image URL", wide: true },
              { key: "desc", label: "Description", type: "textarea" },
            ]}
            onChange={(projects) => set("portfolio.projects", projects)}
            make={() => ({ title: "New project", desc: "", image: "", url: "" })}
            addLabel="Add project"
          />
        </Section>
      </>
    ),

    overlay: (
      <>
        <Section title="On air" description="What the overlay shows right now. GoDECK changes these too.">
          <div className="grid-2">
            <Select label="Current scene" value={overlay.currentScene} options={sceneOptions} onChange={(v) => set("overlay.currentScene", v)} />
            <Select label="Current event" value={overlay.currentEvent} options={eventOptions} onChange={(v) => set("overlay.currentEvent", v)} />
          </div>
        </Section>
        <Section title="Layout">
          <Toggle label="Show the overlay" checked={overlay.enabled} onChange={(v) => set("overlay.enabled", v)} />
          <Segmented label="Layout" value={overlay.layout} options={[["classic", "Classic"], ["centered", "Centred"], ["minimal", "Minimal"], ["lowerthird", "Lower third"]]} onChange={(v) => set("overlay.layout", v)} />
          <div className="toggle-row">
            <Toggle label="Transparent background" checked={overlay.transparent} onChange={(v) => set("overlay.transparent", v)} />
            <Toggle label="Logo & live label" checked={overlay.showLogo} onChange={(v) => set("overlay.showLogo", v)} />
            <Toggle label="Scene title" checked={overlay.showSceneInfo} onChange={(v) => set("overlay.showSceneInfo", v)} />
            <Toggle label="Event" checked={overlay.showEvent} onChange={(v) => set("overlay.showEvent", v)} />
            <Toggle label="Socials bar" checked={overlay.socials.enabled} onChange={(v) => set("overlay.socials.enabled", v)} />
          </div>
          <Field label="Live label"><TextInput value={overlay.liveLabel} onChange={(v) => set("overlay.liveLabel", v)} /></Field>
        </Section>
        <Section title="Countdown" description="Shows on scenes until it reaches zero.">
          <Toggle label="Show the countdown" checked={overlay.countdown.enabled} onChange={(v) => set("overlay.countdown.enabled", v)} />
          <div className="grid-2">
            <Field label="Label"><TextInput value={overlay.countdown.label} onChange={(v) => set("overlay.countdown.label", v)} /></Field>
            <Field label="Ends at">
              <input type="datetime-local" value={toLocalInput(overlay.countdown.target)} onChange={(e) => set("overlay.countdown.target", e.target.value ? new Date(e.target.value).toISOString() : "")} />
            </Field>
          </div>
          <div className="button-row">
            {[1, 5, 10, 15, 30].map((minutes) => (
              <button
                key={minutes}
                type="button"
                className="button ghost small"
                onClick={() => commit(setIn(setIn(config, "overlay.countdown.target", new Date(Date.now() + minutes * 60000).toISOString()), "overlay.countdown.enabled", true))}
              >
                {minutes} min
              </button>
            ))}
            <button type="button" className="button ghost small" onClick={() => set("overlay.countdown.target", "")}>Clear</button>
          </div>
        </Section>
        <Section title="Now playing" description="Type the song in, or follow whatever plays on your Linux desktop (Spotify, mpv, browsers…) through the Dynamix bridge.">
          <Toggle label="Show the song" checked={overlay.nowPlaying.enabled} onChange={(v) => set("overlay.nowPlaying.enabled", v)} />
          <Segmented label="Song comes from" value={overlay.nowPlaying.source} options={[["manual", "Typed in"], ["desktop", "Desktop (Hyprland)"]]} onChange={(v) => set("overlay.nowPlaying.source", v)} />
          {overlay.nowPlaying.source === "desktop" && (() => {
            const [state, text] = bridgeStatus(desktop, overlay.nowPlaying.bridgeUrl);
            return (
              <div className="bridge">
                <p className={`bridge-status ${state}`} aria-live="polite"><span className="bridge-dot" />{text}</p>
                <div className="toggle-row">
                  <Toggle label="Hide when paused" checked={overlay.nowPlaying.hideWhenPaused} onChange={(v) => set("overlay.nowPlaying.hideWhenPaused", v)} />
                  <Toggle label="Progress bar" checked={overlay.nowPlaying.showProgress} onChange={(v) => set("overlay.nowPlaying.showProgress", v)} />
                </div>
                <Field label="Bridge address"><TextInput value={overlay.nowPlaying.bridgeUrl} onChange={(v) => set("overlay.nowPlaying.bridgeUrl", v)} /></Field>
                <p className="muted small">
                  Browsers ask before a website may talk to apps on your computer. If yours asks to let this site access other apps
                  or devices, choose Allow. OBS can't show that question, so give OBS the overlay through the bridge instead:
                </p>
                <div className="button-row">
                  <CopyButton text={() => shareLink(`${overlay.nowPlaying.bridgeUrl.replace(/\/$/, "")}${BASE_PATH}/overlays/`, config)}>Copy OBS overlay link</CopyButton>
                  <CopyButton text={() => shareLink(`${overlay.nowPlaying.bridgeUrl.replace(/\/$/, "")}${BASE_PATH}/go/`, config)}>Copy GoDECK link (via bridge)</CopyButton>
                </div>
                {state !== "online" && (
                  <ol className="bridge-steps">
                    <li>
                      Install the bridge (Python 3 and systemd's busctl, nothing else):
                      <span className="command"><code>{BRIDGE_INSTALL}</code><CopyButton text={() => BRIDGE_INSTALL}>Copy</CopyButton></span>
                    </li>
                    <li>
                      Start it with Hyprland: on Omarchy add this to <code>~/.config/hypr/autostart.lua</code> (or <code>exec-once = dynamix-bridge</code> in <code>hyprland.conf</code>):
                      <span className="command"><code>{BRIDGE_AUTOSTART}</code><CopyButton text={() => BRIDGE_AUTOSTART}>Copy</CopyButton></span>
                    </li>
                    <li>Run <code>dynamix-bridge &amp;</code> once to start it now. This page connects by itself.</li>
                  </ol>
                )}
              </div>
            );
          })()}
          <div className="grid-2">
            <Field label={overlay.nowPlaying.source === "desktop" ? "Fallback title" : "Title"}><TextInput value={overlay.nowPlaying.title} onChange={(v) => set("overlay.nowPlaying.title", v)} /></Field>
            <Field label="Artist"><TextInput value={overlay.nowPlaying.artist} onChange={(v) => set("overlay.nowPlaying.artist", v)} /></Field>
            <Field label="Album art URL"><TextInput value={overlay.nowPlaying.art} onChange={(v) => set("overlay.nowPlaying.art", v)} /></Field>
            <Select label="Corner" value={overlay.nowPlaying.position} options={[["bottom-left", "Bottom left"], ["bottom-right", "Bottom right"], ["top-left", "Top left"], ["top-right", "Top right"]]} onChange={(v) => set("overlay.nowPlaying.position", v)} />
          </div>
        </Section>
        <Section title="Clock & ticker">
          <div className="toggle-row">
            <Toggle label="Clock" checked={overlay.clock.enabled} onChange={(v) => set("overlay.clock.enabled", v)} />
            <Toggle label="24-hour clock" checked={overlay.clock.hour24} onChange={(v) => set("overlay.clock.hour24", v)} />
            <Toggle label="Scrolling ticker" checked={overlay.ticker.enabled} onChange={(v) => set("overlay.ticker.enabled", v)} />
          </div>
          <Field label="Ticker text" wide><TextInput value={overlay.ticker.text} onChange={(v) => set("overlay.ticker.text", v)} /></Field>
          <Range label="Ticker speed" value={overlay.ticker.speed} min={10} max={120} onChange={(v) => set("overlay.ticker.speed", v)} />
        </Section>
        <Section title="Scenes">
          <ListEditor
            items={overlay.scenes}
            title={(scene) => <code>?scene={scene.id}</code>}
            fields={[{ key: "name", label: "Name" }, { key: "id", label: "ID" }, { key: "prenup", label: "Lead-in" }, { key: "desc", label: "Description", wide: true }]}
            onChange={(scenes) => set("overlay.scenes", scenes)}
            make={(n) => ({ id: `scene-${n + 1}`, name: "New scene", desc: "", prenup: "Coming up…" })}
            addLabel="Add scene"
          />
        </Section>
        <Section title="Events">
          <ListEditor
            items={overlay.events}
            fields={[{ key: "name", label: "Name" }, { key: "id", label: "ID" }, { key: "desc", label: "Description", type: "textarea" }]}
            onChange={(events) => set("overlay.events", events)}
            make={(n) => ({ id: `event-${n + 1}`, name: "New event", desc: "" })}
            addLabel="Add event"
          />
        </Section>
      </>
    ),

    go: (
      <>
        <Section title="Deck">
          <Toggle label="Show GoDECK" checked={go.enabled} onChange={(v) => set("go.enabled", v)} />
          <Segmented label="Button style" value={go.buttonStyle} options={["tinted", "solid", "outline"]} onChange={(v) => set("go.buttonStyle", v)} />
          <Range label="Columns" value={go.columns} min={2} max={8} onChange={(v) => set("go.columns", v)} />
          <div className="toggle-row">
            <Toggle label="Button labels" checked={go.showLabels} onChange={(v) => set("go.showLabels", v)} />
            <Toggle label="Scene row" checked={go.showSceneRow} onChange={(v) => set("go.showSceneRow", v)} />
            <Toggle label="Event row" checked={go.showEventRow} onChange={(v) => set("go.showEventRow", v)} />
            <Toggle label="Now playing" checked={go.showNowPlaying} onChange={(v) => set("go.showNowPlaying", v)} />
          </div>
        </Section>
        <Section title="Buttons">
          <ListEditor
            items={go.buttons}
            title={(b) => <span className="button-chip" style={{ "--button": b.color }}>{b.icon} {b.label}</span>}
            fields={[
              { key: "icon", label: "Icon (emoji)" },
              { key: "label", label: "Label" },
              { key: "color", label: "Colour", type: "color" },
              { key: "action", label: "Does", type: "select", options: Object.entries(BUTTON_ACTIONS) },
              { key: "value", label: "Link", wide: true, show: (b) => b.action === "url" },
              { key: "value", label: "Scene", type: "select", options: sceneOptions, show: (b) => b.action === "scene" },
              { key: "value", label: "Event", type: "select", options: eventOptions, show: (b) => b.action === "event" },
              { key: "value", label: "Minutes", show: (b) => b.action === "countdown" },
              { key: "value", label: "Music", type: "select", options: Object.entries(MEDIA_CONTROLS), show: (b) => b.action === "media" },
            ]}
            onChange={(buttons) => set("go.buttons", buttons)}
            make={(n) => ({ id: `b${n + 1}-${Date.now().toString(36)}`, icon: "⭐", label: "New button", url: "", color: theme.accent, action: "url", value: "" })}
            addLabel="Add button"
          />
        </Section>
      </>
    ),

    library: (
      <Section title="Saved setups" description="Keep whole configs under a name in this browser and switch between them.">
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            const name = setupName.trim();
            if (!name) return;
            setLibrary(addToLibrary(name, config));
            setSetupName("");
            setStatus(`Saved setup “${name}”`);
          }}
        >
          <input type="text" placeholder="Name this setup, e.g. Tournament night" value={setupName} onChange={(e) => setSetupName(e.target.value)} />
          <button type="submit" className="button small" disabled={!setupName.trim()}>Save current</button>
        </form>
        {!library.length && <p className="muted">Nothing saved yet.</p>}
        <div className="library">
          {library.map((entry) => (
            <div key={entry.name} className="library-item">
              <Swatch theme={normalize(entry.config).theme} />
              <div className="library-text">
                <strong>{entry.name}</strong>
                <span className="muted small">{normalize(entry.config).theme.headingFont} · {new Date(entry.savedAt).toLocaleString()}</span>
              </div>
              <button type="button" className="button small" onClick={() => { commit(entry.config); setStatus(`Loaded “${entry.name}”`); }}>Load</button>
              <button type="button" className="icon-button danger" aria-label={`Delete ${entry.name}`} onClick={() => setLibrary(removeFromLibrary(entry.name))}>✕</button>
            </div>
          ))}
        </div>
      </Section>
    ),

    share: (
      <>
        <Section title="Share links" description="Your edits live in this browser. A share link carries the whole config, so OBS and other devices show exactly this setup.">
          <div className="share-list">
            {[["Overlay", "../overlays/", "OBS browser source, 1920×1080"], ["GoDECK", "../go/", "phone or tablet"], ["Portfolio", "../", "your public page"], ["Settings", "./", "edit on another device"]].map(([name, page, note]) => (
              <div key={name} className="share-row">
                <div><strong>{name}</strong> <span className="muted small">{note}</span></div>
                <CopyButton text={() => shareLink(page, config)}>Copy link</CopyButton>
              </div>
            ))}
          </div>
          <p className="muted small">Tip: add GoDECK or Settings to OBS as a custom browser dock. Docks share storage with browser sources, so the overlay should follow your edits live.</p>
        </Section>
        <Section title="Backup">
          <div className="button-row">
            <button type="button" className="button small" onClick={exportJson}>⬇ Export config.json</button>
            <button type="button" className="button ghost small" onClick={() => fileInput.current?.click()}>⬆ Import…</button>
            <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files[0] && importJson(e.target.files[0])} />
            <button type="button" className="button ghost small danger" onClick={() => { commit(resetConfig()); setStatus("Back to the site's default"); }}>Reset to default</button>
          </div>
          <p className="muted small">Commit an exported config.json to the repository to make it everyone's default.</p>
        </Section>
      </>
    ),

    advanced: (
      <>
        <Section title="Custom CSS" description="Added after Dynamix's own styles, on every page. Classes worth targeting: .card, .hero-title, .event-name, .deck-button, .nowplaying.">
          <textarea className="code" spellCheck={false} rows={10} value={theme.customCss} placeholder={".event-name {\n  text-shadow: 0 0 24px var(--accent);\n}"} onChange={(e) => set("theme.customCss", e.target.value)} />
        </Section>
        <Section title="Config JSON" description="The full config this browser is using. Edit and apply, or paste one in.">
          <textarea className="code" spellCheck={false} value={json} onChange={(e) => setJson(e.target.value)} rows={22} />
          {jsonError && <p className="error">{jsonError}</p>}
          <div className="button-row">
            <button type="button" className="button small" disabled={json === pretty} onClick={applyJson}>Apply JSON</button>
            <button type="button" className="button ghost small" disabled={json === pretty} onClick={() => setJson(pretty)}>Discard</button>
          </div>
        </Section>
      </>
    ),
  };

  return (
    <Theme theme={theme} className="page settings">
      <Head><title>Customise · Dynamix Toolbox</title></Head>
      <FontPreviewSheet />

      <header className="settings-head">
        <div className="settings-title">
          <h1>Customise</h1>
          <p className="muted small" aria-live="polite">{status || "Changes save in this browser as you go."}</p>
        </div>
        <div className="settings-tools">
          <button type="button" className="icon-button" onClick={undo} disabled={!past.length} title="Undo (Ctrl+Z)" aria-label="Undo">↶</button>
          <button type="button" className="icon-button" onClick={redo} disabled={!future.length} title="Redo (Ctrl+Shift+Z)" aria-label="Redo">↷</button>
          <button type="button" className="button ghost small" onClick={surprise}>🎲 Surprise me</button>
          <nav className="pill-nav">
            <Link href="/">Portfolio</Link>
            <Link href="/overlays">Overlay</Link>
            <Link href="/go">GoDECK</Link>
          </nav>
        </div>
      </header>

      <div className="settings-layout">
        <nav className="settings-tabs" aria-label="Settings sections">
          {TABS.map(([id, icon, name]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "active" : ""}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => {
                setTab(id);
                history.replaceState(null, "", `#${id}`);
              }}
            >
              <span aria-hidden="true">{icon}</span> {name}
            </button>
          ))}
        </nav>

        <div className="settings-body" key={tab}>{panels[tab]}</div>

        <aside className="settings-preview">
          <div className="preview-head">
            <span className="field-label">Live preview</span>
            <div className="segmented small">
              {Object.entries(PREVIEWS).map(([id, p]) => (
                <button key={id} type="button" className={previewKind === id ? "on" : ""} onClick={() => setPreviewKind(id)}>{p.name}</button>
              ))}
            </div>
          </div>
          <Preview kind={previewKind} key={previewKind} />
          <a className="muted small" href={PREVIEWS[previewKind].src} target="_blank" rel="noreferrer">Open {PREVIEWS[previewKind].name.toLowerCase()} in a new tab ↗</a>
        </aside>
      </div>
    </Theme>
  );
}
