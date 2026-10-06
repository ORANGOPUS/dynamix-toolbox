// A 1920×1080 stream overlay for an OBS browser source. ?scene=brb pins one
// scene, so each OBS scene can have its own source.
import Head from "next/head";
import { useEffect, useState } from "react";
import NowPlaying from "../components/NowPlaying";
import Theme from "../components/Theme";
import { useConfig } from "../lib/config";
import { GAME_SCENE } from "../lib/schema";

function useSceneParam() {
  const [scene, setScene] = useState(null);
  useEffect(() => setScene(new URLSearchParams(window.location.search).get("scene")), []);
  return scene;
}

export default function Overlay() {
  const { profile, theme, overlay } = useConfig();
  const pinned = useSceneParam();
  const sceneId = pinned ?? overlay.currentScene;
  const scene = overlay.scenes.find((s) => s.id === sceneId);
  const event = overlay.events.find((e) => e.id === overlay.currentEvent) ?? overlay.events[0];

  const head = (
    <Head>
      <title>Dynamix Overlay</title>
      <style>{"html, body { background: transparent !important; overflow: hidden; }"}</style>
    </Head>
  );

  if (!overlay.enabled) return head;

  // During gameplay only the song shows, over a transparent page.
  if (sceneId === GAME_SCENE || !scene) {
    return (
      <Theme theme={theme} transparent className="overlay">
        {head}
        <NowPlaying track={overlay.nowPlaying} className="nowplaying-float" />
      </Theme>
    );
  }

  return (
    <Theme theme={theme} transparent={overlay.transparent} className="overlay overlay-scene">
      {head}
      <header className="overlay-top">
        <div className="overlay-brand">
          {profile.logo ? <img src={profile.logo} alt="" className="brand-logo" /> : <span className="brand-name">{profile.username}</span>}
          <span className="live-label">{overlay.liveLabel}</span>
        </div>
        <div className="overlay-scene-text">
          <div className="scene-name">{scene.name}</div>
          <div className="scene-desc">{scene.desc}</div>
        </div>
      </header>

      {event && (
        <section className="overlay-event">
          <div className="prenup">{scene.prenup}</div>
          <h1 className="event-name">{event.name}</h1>
          <p className="event-desc">{event.desc}</p>
        </section>
      )}

      <footer className="overlay-bottom">
        <NowPlaying track={overlay.nowPlaying} />
      </footer>
    </Theme>
  );
}
