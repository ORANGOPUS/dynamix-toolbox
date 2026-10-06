// Small pieces shared by the overlay, GoDECK and portfolio.
import { useEffect, useState } from "react";
import { PLATFORMS, socialUrl } from "../lib/schema";

/** The current time, ticking every `ms`. Null until mounted, so static HTML matches. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(timer);
  }, [ms]);
  return now;
}

const two = (n) => String(n).padStart(2, "0");

export function Clock({ hour24, className = "" }) {
  const now = useNow();
  if (now === null) return null;
  const date = new Date(now);
  const hours = date.getHours();
  const text = hour24
    ? `${two(hours)}:${two(date.getMinutes())}`
    : `${hours % 12 || 12}:${two(date.getMinutes())} ${hours < 12 ? "AM" : "PM"}`;
  return <div className={`clock card ${className}`}>{text}</div>;
}

/** Counts down to `target` (an ISO time); hidden once it has passed. */
export function Countdown({ target, label, className = "" }) {
  const now = useNow();
  const end = Date.parse(target);
  if (now === null || !Number.isFinite(end) || end <= now) return null;
  const left = Math.ceil((end - now) / 1000);
  const hours = Math.floor(left / 3600);
  const text = `${hours ? `${hours}:` : ""}${two(Math.floor((left % 3600) / 60))}:${two(left % 60)}`;
  return (
    <div className={`countdown ${className}`}>
      {label && <div className="countdown-label">{label}</div>}
      <div className="countdown-time">{text}</div>
    </div>
  );
}

export function SocialIcon({ platform }) {
  const icon = PLATFORMS[platform]?.icon;
  if (!icon) return <span className="social-glyph">🔗</span>;
  const url = `https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${icon}.svg`;
  return <span className="social-icon" style={{ WebkitMaskImage: `url(${url})`, maskImage: `url(${url})` }} />;
}

/** Social handles; `links` makes them clickable (the portfolio), not on the overlay. */
export function Socials({ socials, links = false, className = "" }) {
  if (!socials.length) return null;
  return (
    <div className={`socials ${className}`}>
      {socials.map((social, index) => {
        const inner = (
          <>
            <SocialIcon platform={social.platform} />
            <span>{social.handle || PLATFORMS[social.platform]?.name}</span>
          </>
        );
        return links ? (
          <a key={index} className="social" href={socialUrl(social)} target="_blank" rel="noreferrer">{inner}</a>
        ) : (
          <span key={index} className="social">{inner}</span>
        );
      })}
    </div>
  );
}

export function Ticker({ text, speed }) {
  if (!text) return null;
  // Duration scales with length so the speed setting reads as pixels per second-ish.
  const duration = Math.max(6, (text.length * 18) / speed);
  return (
    <div className="ticker card">
      <div className="ticker-track" style={{ animationDuration: `${duration}s` }}>
        <span>{text}</span>
        <span aria-hidden="true">{text}</span>
      </div>
    </div>
  );
}
