// Saved setups: whole configs kept under a name in this browser, to flip
// between looks (a "chill" stream and a "tournament" one, say).
import { normalize } from "./schema";

const KEY = "dynamix-library";

export function loadLibrary() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((entry) => entry && entry.name && entry.config) : [];
  } catch {
    return [];
  }
}

function store(entries) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {}
  return entries;
}

export function addToLibrary(name, config) {
  const entries = loadLibrary().filter((entry) => entry.name !== name);
  return store([{ name, savedAt: new Date().toISOString(), config: normalize(config) }, ...entries].slice(0, 30));
}

export const removeFromLibrary = (name) => store(loadLibrary().filter((entry) => entry.name !== name));
