// GoDECK: a touch-friendly deck for a phone or tablet beside the stream.
// Buttons switch scenes and events, start countdowns and toggle overlay parts
// for every Dynamix page open in this browser (or in OBS, when the deck runs as
// an OBS custom dock), or open links.
import Head from "next/head";
import Link from "next/link";
import NowPlaying from "../components/NowPlaying";
import Theme from "../components/Theme";
import { Countdown } from "../components/Widgets";
import { isShared, saveConfig, useConfig } from "../lib/config";
import { applyAction, isActive } from "../lib/actions";
import { GAME_SCENE, setIn } from "../lib/schema";

export default function Go() {
  const config = useConfig();
  const { theme, overlay, go } = config;
  const shared = typeof window !== "undefined" && isShared();
  const apply = (next) => next && !shared && saveConfig(next);
  const scenes = [...overlay.scenes, { id: GAME_SCENE, name: "Game" }];

  return (
    <Theme theme={theme} className="page deck">
      <Head><title>GoDECK</title></Head>
      <header className="deck-head enter">
        <h1>GoDECK</h1>
        <div className="deck-status">
          <Countdown target={overlay.countdown.target} label="" className="countdown-small" />
          <Link className="button ghost small" href="/settings">Customise</Link>
        </div>
      </header>

      {shared && <p className="notice card">This deck is opened from a share link, so its buttons can't change anything. Open GoDECK without the link to control the overlay.</p>}

      {!go.enabled ? (
        <p className="muted">GoDECK is turned off in settings.</p>
      ) : (
        <>
          {go.showSceneRow && (
            <section className="enter">
              <h2 className="deck-label">Scene</h2>
              <div className="chip-row">
                {scenes.map((scene) => (
                  <button key={scene.id} className={`chip ${overlay.currentScene === scene.id ? "active" : ""}`} onClick={() => apply(setIn(config, "overlay.currentScene", scene.id))}>
                    {scene.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {go.showEventRow && (
            <section className="enter">
              <h2 className="deck-label">Event</h2>
              <div className="chip-row">
                {overlay.events.map((event) => (
                  <button key={event.id} className={`chip ${overlay.currentEvent === event.id ? "active" : ""}`} onClick={() => apply(setIn(config, "overlay.currentEvent", event.id))}>
                    {event.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className={`deck-grid deck-${go.buttonStyle}`} style={{ gridTemplateColumns: `repeat(${go.columns}, 1fr)` }}>
            {go.buttons.map((button, index) => {
              const content = (
                <>
                  <span className="deck-icon">{button.icon}</span>
                  {go.showLabels && <span className="deck-text">{button.label}</span>}
                </>
              );
              const props = {
                className: `deck-button enter ${isActive(config, button) ? "active" : ""}`,
                style: { "--button": button.color, "--i": index },
                title: button.label,
              };
              return button.action === "url" ? (
                <a key={`${button.id}-${index}`} {...props} href={button.value || undefined} target="_blank" rel="noreferrer">{content}</a>
              ) : (
                <button key={`${button.id}-${index}`} {...props} type="button" onClick={() => apply(applyAction(config, button))}>{content}</button>
              );
            })}
          </section>

          {go.showNowPlaying && <NowPlaying track={overlay.nowPlaying} className="enter" />}
        </>
      )}
    </Theme>
  );
}
