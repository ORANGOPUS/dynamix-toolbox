// A 1920×1080 stream overlay for an OBS browser source. ?scene=brb pins one
// scene, so each OBS scene can have its own source.
import Head from "next/head";
import { useEffect, useState } from "react";
import NowPlaying from "../components/NowPlaying";
import Theme from "../components/Theme";
import { Clock, Countdown, Socials, Ticker } from "../components/Widgets";
import { useConfig } from "../lib/config";
import { GAME_SCENE } from "../lib/schema";

function useSceneParam() {
  const [scene, setScene] = useState(null);
  useEffect(() => setScene(new URLSearchParams(window.location.search).get("scene")), []);
  return scene;
}

/** Fits the 1920×1080 stage into the window and centres it, for previews and odd source sizes. */
function useStageFit() {
  const [fit, setFit] = useState({ scale: 1, x: 0, y: 0 });
  useEffect(() => {
    const measure = () => {
      const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
      setFit({ scale, x: (window.innerWidth - 1920 * scale) / 2, y: (window.innerHeight - 1080 * scale) / 2 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return fit;
}

export default function Overlay() {
  const { profile, theme, overlay } = useConfig();
  const pinned = useSceneParam();
  const fit = useStageFit();
  const sceneId = pinned ?? overlay.currentScene;
  const scene = overlay.scenes.find((s) => s.id === sceneId);
  const event = overlay.events.find((e) => e.id === overlay.currentEvent) ?? overlay.events[0];
  const gameplay = sceneId === GAME_SCENE || !scene;

  const head = (
    <Head>
      <title>Dynamix Overlay</title>
      <style>{"html, body { background: transparent !important; overflow: hidden; }"}</style>
    </Head>
  );
  if (!overlay.enabled) return head;

  const brand = overlay.showLogo && (
    <div className="overlay-brand">
      {profile.logo ? <img src={profile.logo} alt="" className="brand-logo" /> : <span className="brand-name">{profile.username}</span>}
      {overlay.liveLabel && <span className="live-label"><span className="live-dot" />{overlay.liveLabel}</span>}
    </div>
  );

  return (
    <div className="stage-wrap">
      {head}
      <div className="stage" style={{ transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})` }}>
        <Theme
          theme={theme}
          transparent={gameplay || overlay.transparent}
          className={`overlay overlay-${overlay.layout} ${gameplay ? "overlay-game" : ""}`}
        >
          {!gameplay && (
            <>
              <header className="overlay-top enter">
                {brand}
                {overlay.showSceneInfo && (
                  <div className="overlay-scene-text">
                    <div className="scene-name">{scene.name}</div>
                    {scene.desc && <div className="scene-desc">{scene.desc}</div>}
                  </div>
                )}
              </header>

              <section className="overlay-middle">
                {overlay.countdown.enabled && (
                  <Countdown target={overlay.countdown.target} label={overlay.countdown.label} className="enter" />
                )}
                {overlay.showEvent && event && (
                  <div className="overlay-event enter" style={{ "--i": 2 }}>
                    {scene.prenup && <div className="prenup">{scene.prenup}</div>}
                    <h1 className="event-name">{event.name}</h1>
                    {event.desc && <p className="event-desc">{event.desc}</p>}
                  </div>
                )}
              </section>

              {overlay.socials.enabled && <Socials socials={profile.socials} className="overlay-socials enter" />}
            </>
          )}

          <div className={`corner corner-${overlay.nowPlaying.position}`}>
            <NowPlaying track={overlay.nowPlaying} className="enter" />
          </div>
          {overlay.clock.enabled && (
            <div className={`corner corner-${overlay.nowPlaying.position === "top-right" ? "top-left" : "top-right"}`}>
              <Clock hour24={overlay.clock.hour24} />
            </div>
          )}
          {overlay.ticker.enabled && <Ticker text={overlay.ticker.text} speed={overlay.ticker.speed} />}
        </Theme>
      </div>
    </div>
  );
}
