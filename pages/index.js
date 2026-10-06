import Head from "next/head";
import Link from "next/link";
import Theme from "../components/Theme";
import { Socials } from "../components/Widgets";
import { asset } from "../lib/asset";
import { useConfig } from "../lib/config";

function Nav() {
  return (
    <nav className="pill-nav">
      <Link href="/overlays">Overlays</Link>
      <Link href="/go">GoDECK</Link>
      <Link href="/settings">Customise</Link>
    </nav>
  );
}

export default function Portfolio() {
  const { profile, theme, portfolio } = useConfig();

  if (!portfolio.enabled) {
    return (
      <Theme theme={theme} className="page center">
        <Head><title>Dynamix Toolbox</title></Head>
        <div className="card panel-card enter">
          <h1>Dynamix Toolbox</h1>
          <p className="muted">The portfolio page is turned off.</p>
          <Nav />
        </div>
      </Theme>
    );
  }

  const hero = portfolio.heroImage && asset(portfolio.heroImage);

  return (
    <Theme theme={theme} className={`page portfolio layout-${portfolio.layout}`}>
      <Head>
        <title>{portfolio.title}</title>
        <meta name="description" content={portfolio.subtitle} />
      </Head>
      <header className="portfolio-head enter">
        <div className="brand">
          {profile.logo ? <img src={profile.logo} alt={profile.username} className="brand-logo" /> : <span className="brand-name">{profile.username}</span>}
        </div>
        <Nav />
      </header>

      <main className="hero">
        <section className="hero-text">
          {portfolio.showAvatar && profile.avatar && <img className="avatar enter" style={{ "--i": 1 }} src={profile.avatar} alt={profile.name} />}
          {profile.tagline && <div className="eyebrow enter" style={{ "--i": 2 }}>{profile.tagline}</div>}
          <h1 className="hero-title enter" style={{ "--i": 3 }}>{portfolio.title}</h1>
          <p className="hero-subtitle enter" style={{ "--i": 4 }}>{portfolio.subtitle}</p>
          <div className="hero-actions enter" style={{ "--i": 5 }}>
            {portfolio.button.text && (
              <a className="button" href={portfolio.button.url || "#"}>{portfolio.button.text}</a>
            )}
            {portfolio.links.map((link, index) => (
              <a key={index} className="button ghost" href={link.url}>{link.label}</a>
            ))}
          </div>
          {portfolio.showSocials && <Socials socials={profile.socials} links className="enter" />}
        </section>
        {hero && portfolio.layout !== "centered" && (
          <section className="hero-art enter" style={{ "--i": 3 }}>
            <img className="showcase" src={hero} alt="" />
          </section>
        )}
      </main>

      {portfolio.about && (
        <section className="card about enter">
          <h2>About</h2>
          {portfolio.about.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </section>
      )}

      {portfolio.projects.length > 0 && (
        <section className="projects">
          <h2>Projects</h2>
          <div className="project-grid">
            {portfolio.projects.map((project, index) => (
              <a key={index} className="card project enter" style={{ "--i": index }} href={project.url || undefined} target="_blank" rel="noreferrer">
                {project.image && <img className="project-image" src={asset(project.image)} alt="" />}
                <div className="project-body">
                  <h3>{project.title}</h3>
                  {project.desc && <p className="muted">{project.desc}</p>}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {(profile.team.enabled || portfolio.footer) && (
        <footer className="card team enter">
          {profile.team.enabled && (
            <>
              <div><span className="muted">{profile.team.before}</span> <strong>{profile.team.name}</strong></div>
              <p className="muted">{profile.team.desc}</p>
            </>
          )}
          {portfolio.footer && <p className="muted small">{portfolio.footer}</p>}
        </footer>
      )}
    </Theme>
  );
}
