// Where the live configuration comes from on a static site. In order:
//   1. a share link: #config=<base64url JSON> in the page URL (for OBS),
//   2. what the settings panel saved in this browser (localStorage),
//   3. config.json, baked in at build time.
// Saves are announced to the other tabs and OBS docks of this browser, so an
// overlay open next to the panel updates as you edit.
import { useEffect, useState } from "react";
import baked from "../config.json";
import { normalize } from "./schema";

const KEY = "dynamix-config";
const CHANNEL = "dynamix-config";

export const BUILT_IN = normalize(baked);

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text) {
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

function fromHash() {
  const match = window.location.hash.match(/config=([A-Za-z0-9_-]+)/);
  if (!match) return null;
  try {
    return normalize(JSON.parse(fromBase64Url(match[1])));
  } catch {
    return null;
  }
}

function fromStorage() {
  try {
    const saved = window.localStorage.getItem(KEY);
    return saved ? normalize(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
}

/** The config this page should show right now. Browser only. */
export function loadConfig() {
  return fromHash() ?? fromStorage() ?? BUILT_IN;
}

/** Whether this page is pinned to a share link (and so ignores saves). */
export const isShared = () => typeof window !== "undefined" && fromHash() !== null;

/** Save in this browser and tell its other tabs. Returns what was saved. */
export function saveConfig(input) {
  const config = normalize(input);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(config));
  } catch {
    // Private windows can refuse storage; the other tabs still hear about it.
  }
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage(config);
    channel.close();
  } catch {
    // Old browsers: the storage event below still covers other tabs.
  }
  return config;
}

/** Forget this browser's edits and go back to config.json. */
export function resetConfig() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  return saveConfig(BUILT_IN);
}

/** A link to `page` that carries `config` with it, for OBS and other browsers. */
export function shareLink(page, config) {
  const url = new URL(page, window.location.href);
  url.hash = `config=${toBase64Url(JSON.stringify(config))}`;
  return url.toString();
}

/**
 * The live config for a page. The first render uses config.json so the static
 * HTML matches; after that it follows the share link or this browser's saves.
 */
export function useConfig() {
  const [config, setConfig] = useState(BUILT_IN);

  useEffect(() => {
    const refresh = () => setConfig(loadConfig());
    refresh();
    const pinned = () => fromHash() !== null;

    let channel;
    try {
      channel = new BroadcastChannel(CHANNEL);
      channel.onmessage = (event) => {
        if (!pinned()) setConfig(normalize(event.data));
      };
    } catch {}
    const onStorage = (event) => {
      if (event.key === KEY && !pinned()) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("hashchange", refresh);
    return () => {
      channel?.close();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("hashchange", refresh);
    };
  }, []);

  return config;
}
