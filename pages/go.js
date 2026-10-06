// GoDECK: a touch-friendly deck for a phone or tablet beside the stream.
// Scene buttons switch the overlay open in this browser (or in OBS, when the
// deck runs as an OBS custom dock).
import Head from "next/head";
import Link from "next/link";
import NowPlaying from "../components/NowPlaying";
import Theme from "../components/Theme";
import { saveConfig, useConfig, isShared } from "../lib/config";
import { GAME_SCENE, setIn } from "../lib/schema";

export default function Go() {
  const config = useConfig();
  const { theme, overlay, go } = config;
  const scenes = [...overlay.scenes, { id: GAME_SCENE, name: "Game" }];
  const switchTo = (id) => !isShared() && saveConfig(setIn(config, "overlay.currentScene", id));

  return (
    <Theme theme={theme} className="page deck">
      <Head><title>GoDECK</title></Head>
      <header className="deck-head">
        <h1>GoDECK</h1>
        <Link className="button ghost small" href="/settings">Settings</Link>
      </header>

      {!go.enabled ? (
        <p className="muted">GoDECK is turned off in settings.</p>
      ) : (
        <>
          <section>
            <h2 className="deck-label">Scene</h2>
            <div className="scene-row">
              {scenes.map((scene) => (
                <button
                  key={scene.id}
                  className={`scene-button ${overlay.currentScene === scene.id ? "active" : ""}`}
                  onClick={() => switchTo(scene.id)}
                >
                  {scene.name}
                </button>
              ))}
            </div>
          </section>

          <section className="deck-grid" style={{ gridTemplateColumns: `repeat(${go.columns}, 1fr)` }}>
            {go.buttons.map((button) => (
              <a
                key={button.id}
                className="deck-button"
                style={{ "--button": button.color }}
                href={button.url || undefined}
                target={button.url ? "_blank" : undefined}
                rel="noreferrer"
              >
                <span className="deck-icon">{button.icon}</span>
                <span className="deck-text">{button.label}</span>
              </a>
            ))}
          </section>

          {go.showNowPlaying && <NowPlaying track={overlay.nowPlaying} />}
        </>
      )}
    </Theme>
  );
}
