// The config panel. Every change is saved in this browser straight away and
// shows up live on the other Dynamix pages open in it. Share links carry the
// config to OBS or another device; Export gives a config.json for the repo.
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Theme from "../components/Theme";
import { BUILT_IN, isShared, loadConfig, resetConfig, saveConfig, shareLink } from "../lib/config";
import { FONTS, GAME_SCENE, THEME_PRESETS, normalize, setIn } from "../lib/schema";

const get = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);

function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function Section({ id, title, children }) {
  return (
    <section className="settings-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** An editable list of objects: one row of inputs per item. */
function ListEditor({ items, fields, onChange, make, addLabel }) {
  const update = (index, key, value) => onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  const move = (index, by) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    onChange(next);
  };
  return (
    <div className="list-editor">
      {items.map((item, index) => (
        <div className="list-row" key={index}>
          {fields.map(({ key, label, type = "text", wide }) => (
            <Field key={key} label={label}>
              {type === "textarea" ? (
                <textarea rows={2} value={item[key]} onChange={(e) => update(index, key, e.target.value)} />
              ) : (
                <input className={wide ? "wide" : ""} type={type} value={item[key]} onChange={(e) => update(index, key, e.target.value)} />
              )}
            </Field>
          ))}
          <div className="row-actions">
            <button type="button" className="icon-button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up">↑</button>
            <button type="button" className="icon-button" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Move down">↓</button>
            <button type="button" className="icon-button danger" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remove">✕</button>
          </div>
        </div>
      ))}
      <button type="button" className="button ghost small" onClick={() => onChange([...items, make(items.length)])}>{addLabel}</button>
    </div>
  );
}

function CopyButton({ text, children }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="button ghost small"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text());
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          window.prompt("Copy this link:", text());
        }
      }}
    >
      {copied ? "Copied" : children}
    </button>
  );
}

/** The overlay page, scaled down from 1920×1080 to fit the panel. */
function OverlayPreview() {
  const box = useRef(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 1920));
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="preview" ref={box}>
      <iframe title="Overlay preview" src="../overlays/" style={{ transform: `scale(${scale})` }} />
    </div>
  );
}

export default function Settings() {
  const [config, setConfig] = useState(BUILT_IN);
  const [status, setStatus] = useState("");
  const [json, setJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  const fileInput = useRef(null);

  useEffect(() => {
    // A share link opened here becomes this browser's config, then the hash goes.
    const loaded = loadConfig();
    if (isShared()) {
      saveConfig(loaded);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    setConfig(loaded);
  }, []);

  const pretty = useMemo(() => JSON.stringify(config, null, 2), [config]);
  useEffect(() => {
    setJson(pretty);
    setJsonError("");
  }, [pretty]);

  const commit = (next) => {
    const saved = saveConfig(next);
    setConfig(saved);
    setStatus(`Saved in this browser at ${new Date().toLocaleTimeString()}`);
  };
  const set = (path, value) => commit(setIn(config, path, value));
  const bind = (path, type = "text") => ({
    type,
    value: get(config, path),
    onChange: (e) => set(path, type === "number" ? Number(e.target.value) : e.target.value),
  });
  const toggle = (path) => ({ type: "checkbox", checked: Boolean(get(config, path)), onChange: (e) => set(path, e.target.checked) });

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
    const a = Object.assign(document.createElement("a"), { href: url, download: "config.json" });
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file) => {
    try {
      commit(normalize(JSON.parse(await file.text())));
    } catch (error) {
      setStatus(`Couldn't import ${file.name}: ${error.message}`);
    }
  };

  const { profile, theme, portfolio, overlay, go } = config;
  const sceneOptions = [...overlay.scenes, { id: GAME_SCENE, name: "Game (song only)" }];

  return (
    <Theme theme={theme} className="page settings">
      <Head><title>Settings · Dynamix Toolbox</title></Head>

      <header className="settings-head">
        <div>
          <h1>Settings</h1>
          <p className="muted small" aria-live="polite">{status || "Changes save in this browser as you type."}</p>
        </div>
        <nav className="pill-nav">
          <Link href="/">Portfolio</Link>
          <Link href="/overlays">Overlays</Link>
          <Link href="/go">GoDECK</Link>
        </nav>
      </header>

      <div className="settings-layout">
        <aside className="settings-toc">
          {[["profile", "Profile"], ["theme", "Theme"], ["portfolio", "Portfolio"], ["overlay", "Overlay"], ["go", "GoDECK"], ["share", "Share & backup"], ["json", "Config JSON"]].map(([id, name]) => (
            <a key={id} href={`#${id}`}>{name}</a>
          ))}
        </aside>

        <div className="settings-body">
          <Section id="profile" title="Profile">
            <div className="grid-2">
              <Field label="Name"><input {...bind("profile.name")} /></Field>
              <Field label="Username"><input {...bind("profile.username")} /></Field>
              <Field label="Avatar URL"><input {...bind("profile.avatar")} /></Field>
              <Field label="Logo URL" hint="Leave empty to show the username instead."><input {...bind("profile.logo")} /></Field>
            </div>
            <Field label="Show team"><input {...toggle("profile.team.enabled")} /></Field>
            {profile.team.enabled && (
              <div className="grid-2">
                <Field label="Before the name"><input {...bind("profile.team.before")} /></Field>
                <Field label="Team name"><input {...bind("profile.team.name")} /></Field>
                <Field label="Team description"><textarea rows={2} {...bind("profile.team.desc")} /></Field>
              </div>
            )}
          </Section>

          <Section id="theme" title="Theme">
            <div className="presets">
              {Object.entries(THEME_PRESETS).map(([name, preset]) => (
                <button
                  type="button"
                  key={name}
                  className="preset"
                  style={{ background: preset.background, color: preset.text, borderColor: preset.accent }}
                  onClick={() => commit({ ...config, theme: { ...theme, ...preset } })}
                >
                  <span className="preset-dot" style={{ background: preset.accent }} /> {name}
                </button>
              ))}
            </div>
            <div className="grid-3">
              {["accent", "background", "surface", "text", "muted"].map((key) => (
                <Field key={key} label={key[0].toUpperCase() + key.slice(1)}>
                  <span className="color-input">
                    <input type="color" value={theme[key].slice(0, 7)} onChange={(e) => set(`theme.${key}`, e.target.value)} />
                    <input value={theme[key]} onChange={(e) => set(`theme.${key}`, e.target.value)} />
                  </span>
                </Field>
              ))}
              <Field label="Font">
                <select {...bind("theme.font")}>
                  {FONTS.map((font) => <option key={font}>{font}</option>)}
                </select>
              </Field>
              <Field label={`Corner radius: ${theme.radius}px`}><input {...bind("theme.radius", "range")} min={0} max={40} onChange={(e) => set("theme.radius", Number(e.target.value))} /></Field>
              <Field label="Background image URL"><input {...bind("theme.backgroundImage")} /></Field>
            </div>
          </Section>

          <Section id="portfolio" title="Portfolio">
            <Field label="Show the portfolio page"><input {...toggle("portfolio.enabled")} /></Field>
            <div className="grid-2">
              <Field label="Title"><input {...bind("portfolio.title")} /></Field>
              <Field label="Subtitle"><input {...bind("portfolio.subtitle")} /></Field>
              <Field label="Button text"><input {...bind("portfolio.button.text")} /></Field>
              <Field label="Button link"><input {...bind("portfolio.button.url")} /></Field>
            </div>
            <h3>Links</h3>
            <ListEditor
              items={portfolio.links}
              fields={[{ key: "label", label: "Label" }, { key: "url", label: "URL", wide: true }]}
              onChange={(links) => set("portfolio.links", links)}
              make={() => ({ label: "New link", url: "https://" })}
              addLabel="Add link"
            />
          </Section>

          <Section id="overlay" title="Overlay">
            <div className="grid-3">
              <Field label="Show the overlay"><input {...toggle("overlay.enabled")} /></Field>
              <Field label="Transparent background"><input {...toggle("overlay.transparent")} /></Field>
              <Field label="Live label"><input {...bind("overlay.liveLabel")} /></Field>
              <Field label="Current scene">
                <select {...bind("overlay.currentScene")}>
                  {sceneOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
              <Field label="Current event">
                <select {...bind("overlay.currentEvent")}>
                  {overlay.events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </Field>
            </div>
            <h3>Scenes</h3>
            <ListEditor
              items={overlay.scenes}
              fields={[{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "desc", label: "Description", wide: true }, { key: "prenup", label: "Lead-in" }]}
              onChange={(scenes) => set("overlay.scenes", scenes)}
              make={(n) => ({ id: `scene-${n + 1}`, name: "New scene", desc: "", prenup: "Coming up…" })}
              addLabel="Add scene"
            />
            <h3>Events</h3>
            <ListEditor
              items={overlay.events}
              fields={[{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "desc", label: "Description", type: "textarea" }]}
              onChange={(events) => set("overlay.events", events)}
              make={(n) => ({ id: `event-${n + 1}`, name: "New event", desc: "" })}
              addLabel="Add event"
            />
            <h3>Now playing</h3>
            <div className="grid-3">
              <Field label="Show"><input {...toggle("overlay.nowPlaying.enabled")} /></Field>
              <Field label="Title"><input {...bind("overlay.nowPlaying.title")} /></Field>
              <Field label="Artist"><input {...bind("overlay.nowPlaying.artist")} /></Field>
              <Field label="Album art URL"><input {...bind("overlay.nowPlaying.art")} /></Field>
            </div>
            <OverlayPreview />
          </Section>

          <Section id="go" title="GoDECK">
            <div className="grid-3">
              <Field label="Show GoDECK"><input {...toggle("go.enabled")} /></Field>
              <Field label="Show now playing"><input {...toggle("go.showNowPlaying")} /></Field>
              <Field label="Columns"><input {...bind("go.columns", "number")} min={2} max={6} /></Field>
            </div>
            <ListEditor
              items={go.buttons}
              fields={[{ key: "icon", label: "Icon" }, { key: "label", label: "Label" }, { key: "url", label: "Opens URL", wide: true }, { key: "color", label: "Colour", type: "color" }]}
              onChange={(buttons) => set("go.buttons", buttons)}
              make={(n) => ({ id: `b${n + 1}`, icon: "⭐", label: "New button", url: "", color: theme.accent })}
              addLabel="Add button"
            />
          </Section>

          <Section id="share" title="Share & backup">
            <p className="muted">
              Edits live in this browser only. To use them in OBS or on another device, copy a link: it carries the whole
              config. Export a config.json and commit it to make it the site's default for everyone.
            </p>
            <div className="button-row">
              <CopyButton text={() => shareLink("../overlays/", config)}>Copy overlay link</CopyButton>
              <CopyButton text={() => shareLink("../go/", config)}>Copy GoDECK link</CopyButton>
              <CopyButton text={() => shareLink("../", config)}>Copy portfolio link</CopyButton>
              <CopyButton text={() => shareLink("./", config)}>Copy settings link</CopyButton>
            </div>
            <div className="button-row">
              <button type="button" className="button small" onClick={exportJson}>Export config.json</button>
              <button type="button" className="button ghost small" onClick={() => fileInput.current?.click()}>Import…</button>
              <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files[0] && importJson(e.target.files[0])} />
              <button
                type="button"
                className="button ghost small danger"
                onClick={() => {
                  setConfig(resetConfig());
                  setStatus("Back to the site's config.json");
                }}
              >
                Reset to default
              </button>
            </div>
          </Section>

          <Section id="json" title="Config JSON">
            <p className="muted">The full config this browser is using. Edit it here and apply, or paste one in.</p>
            <textarea className="json" spellCheck={false} value={json} onChange={(e) => setJson(e.target.value)} rows={24} />
            {jsonError && <p className="error">{jsonError}</p>}
            <div className="button-row">
              <button type="button" className="button small" disabled={json === pretty} onClick={applyJson}>Apply JSON</button>
              <button type="button" className="button ghost small" disabled={json === pretty} onClick={() => setJson(pretty)}>Discard</button>
            </div>
          </Section>
        </div>
      </div>
    </Theme>
  );
}
