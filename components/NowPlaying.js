import { asset } from "../lib/asset";

export default function NowPlaying({ track, className = "" }) {
  if (!track.enabled || !track.title) return null;
  return (
    <div className={`nowplaying ${className}`}>
      <img className="nowplaying-art" src={track.art || asset("pretzel.png")} alt="" />
      <div>
        <div className="nowplaying-label">Now playing</div>
        <div className="nowplaying-title">{track.title}</div>
        {track.artist && <div className="nowplaying-artist">{track.artist}</div>}
      </div>
    </div>
  );
}
