import { asset } from "../lib/asset";
import { useNow } from "./Widgets";

const clock = (ms) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

function Progress({ track }) {
  const now = useNow(500);
  if (!track.length) return null;
  // The bridge sends the position at a moment; count on from there while playing.
  const position = Math.min(track.length, track.position + (track.playing && now ? Math.max(0, now - track.at) : 0));
  return (
    <div className="nowplaying-progress">
      <div className="nowplaying-bar"><span style={{ width: `${(position / track.length) * 100}%` }} /></div>
      <div className="nowplaying-times"><span>{clock(position)}</span><span>{clock(track.length)}</span></div>
    </div>
  );
}

/** `track` comes from resolveTrack(); `controls` adds media buttons (GoDECK). */
export default function NowPlaying({ track, showProgress = true, controls = null, className = "" }) {
  if (!track.enabled || !track.title) return null;
  return (
    <div className={`nowplaying card ${track.live && !track.playing ? "is-paused" : ""} ${className}`}>
      <img className="nowplaying-art" src={track.art || asset("pretzel.png")} alt="" />
      <div className="nowplaying-text">
        <div className="nowplaying-label">
          {track.live && track.playing && <span className="eq" aria-hidden="true"><i /><i /><i /></span>}
          {track.live ? (track.playing ? "Now playing" : "Paused") : "Now playing"}
        </div>
        <div className="nowplaying-title">{track.title}</div>
        {track.artist && <div className="nowplaying-artist">{track.artist}</div>}
        {showProgress && track.live && <Progress track={track} />}
      </div>
      {controls}
    </div>
  );
}
