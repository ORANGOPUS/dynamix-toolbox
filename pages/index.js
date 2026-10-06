import Head from "next/head";
import Link from "next/link";
import Theme from "../components/Theme";
import { asset } from "../lib/asset";
import { useConfig } from "../lib/config";

export default function Portfolio() {
  const { profile, theme, portfolio } = useConfig();

  if (!portfolio.enabled) {
    return (
      <Theme theme={theme} className="page center">
        <Head><title>Dynamix Toolbox</title></Head>
        <div className="panel-card">
          <h1>Dynamix Toolbox</h1>
          <p className="muted">The portfolio page is turned off.</p>
          <nav className="pill-nav">
            <Link href="/overlays">Overlays</Link>
            <Link href="/go">GoDECK</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </div>
      </Theme>
    );
  }

  return (
    <Theme theme={theme} className="page portfolio">
      <Head><title>{portfolio.title}</title></Head>
      <header className="portfolio-head">
        <div className="brand">
          {profile.logo ? <img src={profile.logo} alt="" className="brand-logo" /> : <span className="brand-name">{profile.username}</span>}
        </div>
        <nav className="pill-nav">
          <Link href="/overlays">Overlays</Link>
          <Link href="/go">GoDECK</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </header>

      <main className="hero">
        <section className="hero-text">
          {profile.avatar && <img className="avatar" src={profile.avatar} alt={profile.name} />}
          <h1 className="hero-title">{portfolio.title}</h1>
          <p className="hero-subtitle">{portfolio.subtitle}</p>
          <div className="hero-actions">
            {portfolio.button.text && (
              <a className="button" href={portfolio.button.url || "#"}>{portfolio.button.text}</a>
            )}
            {portfolio.links.map((link) => (
              <a key={link.url + link.label} className="button ghost" href={link.url}>{link.label}</a>
            ))}
          </div>
        </section>
        <section className="hero-art">
          <img className="showcase" src={asset("heroimage.png")} alt="" />
        </section>
      </main>

      {profile.team.enabled && (
        <footer className="team">
          <span className="muted">{profile.team.before}</span> <strong>{profile.team.name}</strong>
          <p className="muted">{profile.team.desc}</p>
        </footer>
      )}
    </Theme>
  );
}
