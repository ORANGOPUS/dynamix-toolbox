// What GoDECK buttons do to the config.
import { setIn } from "./schema";

/** What pressing `button` does to `config`; null for buttons that only open a link. */
export function applyAction(config, button) {
  const { overlay } = config;
  switch (button.action) {
    case "scene":
      return setIn(config, "overlay.currentScene", button.value);
    case "event":
      return setIn(config, "overlay.currentEvent", button.value);
    case "countdown": {
      const minutes = Number(button.value) || 5;
      const withTimer = setIn(config, "overlay.countdown.target", new Date(Date.now() + minutes * 60000).toISOString());
      return setIn(withTimer, "overlay.countdown.enabled", true);
    }
    case "nowplaying":
      return setIn(config, "overlay.nowPlaying.enabled", !overlay.nowPlaying.enabled);
    case "ticker":
      return setIn(config, "overlay.ticker.enabled", !overlay.ticker.enabled);
    default:
      return null;
  }
}

export function isActive(config, button) {
  const { overlay } = config;
  if (button.action === "scene") return overlay.currentScene === button.value;
  if (button.action === "event") return overlay.currentEvent === button.value;
  if (button.action === "nowplaying") return overlay.nowPlaying.enabled;
  if (button.action === "ticker") return overlay.ticker.enabled;
  return false;
}
