// The music playing on this computer, from tools/dynamix-bridge (MPRIS over
// D-Bus on Linux desktops like Hyprland). The bridge pushes changes as
// server-sent events; when it isn't running the page falls back to the
// now-playing fields typed into settings.
import { useEffect, useState } from "react";

const OFF = { status: "off", track: null };

/** { status: off | connecting | connected | offline, track } for this config. */
export function useDesktopTrack(nowPlaying) {
  const { source, bridgeUrl } = nowPlaying;
  const [state, setState] = useState(OFF);

  useEffect(() => {
    if (source !== "desktop" || !bridgeUrl) {
      setState(OFF);
      return;
    }
    setState({ status: "connecting", track: null });
    let events;
    try {
      events = new EventSource(`${bridgeUrl.replace(/\/$/, "")}/events`);
    } catch {
      setState({ status: "offline", track: null });
      return;
    }
    events.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        setState({ status: "connected", track: data.track ?? null });
      } catch {}
    };
    // EventSource retries by itself every few seconds, so starting the bridge
    // later connects without a reload.
    events.onerror = () => setState((old) => (old.status === "connected" ? { status: "offline", track: null } : { ...old, status: "offline" }));
    return () => events.close();
  }, [source, bridgeUrl]);

  return state;
}

/**
 * What the now-playing card shows: the desktop track when the bridge is
 * connected, otherwise the typed-in fields. `enabled` is false when it should hide.
 */
export function resolveTrack(nowPlaying, desktop) {
  const manual = { ...nowPlaying, playing: false, length: 0, position: 0, at: 0, player: "" };
  if (nowPlaying.source !== "desktop" || desktop.status !== "connected") return manual;
  const track = desktop.track;
  if (!track || !track.title) return { ...manual, enabled: false };
  const playing = track.status === "Playing";
  const base = nowPlaying.bridgeUrl.replace(/\/$/, "");
  return {
    enabled: nowPlaying.enabled && (playing || !nowPlaying.hideWhenPaused),
    title: track.title,
    artist: track.artist,
    art: track.art ? (track.art.startsWith("/") ? base + track.art : track.art) : nowPlaying.art,
    playing,
    length: track.length,
    position: track.position,
    at: track.at,
    player: track.player,
    live: true,
  };
}

/** Ask the bridge to play-pause, skip, etc. Resolves to an error message or "". */
export async function sendMediaControl(bridgeUrl, action) {
  try {
    const response = await fetch(`${bridgeUrl.replace(/\/$/, "")}/control/${action}`, { method: "POST" });
    if (response.ok) return "";
    const body = await response.json().catch(() => ({}));
    return body.error || `Bridge answered ${response.status}`;
  } catch {
    return "Can't reach the desktop bridge";
  }
}
