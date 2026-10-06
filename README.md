![](https://i.imgur.com/R0gZo17.png)

A mix of tools at your disposal. Integrating all the services out there into one seamless web-stack.

Coded with 🧡 by [🐙](https://orangop.us)

<a href="https://www.producthunt.com/posts/dynamix-toolbox?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-dynamix-toolbox" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=281386&theme=dark" alt="Dynamix Toolbox - A self-hosted sandbox to boost your workflow. | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

## Features
- **Overlays** (/overlays): four layouts (classic, centred, minimal, lower third), scenes and events, a countdown, clock, now playing card, socials bar and scrolling ticker
- **GoDECK** (/go): a touch deck whose buttons switch scenes and events, start countdowns, toggle the music card and ticker, control your desktop's music, or open links
- **Desktop music**: the now-playing card follows Spotify, mpv or any MPRIS player on Hyprland and other Linux desktops, via a tiny local bridge
- **Portfolio** (/): three layouts, about section, projects grid, socials and team
- **Customise** (/settings), a studio with a live preview:
  - 113 Google Fonts with a searchable browser, 16 one-click pairings, weights, case, spacing and text size
  - 15 theme presets plus "Surprise me", six colours, solid/gradient/aurora/image backgrounds and dot/grid/line/noise patterns
  - Five card styles (solid, glass, outline, neon, flat), radius, borders, shadows and entrance animations
  - Undo/redo, saved setups, share links, JSON import/export and custom CSS
- Runs anywhere static: built on Next.js and React, hosted on GitHub Pages

## Planned Features
- Razer Chroma Integration
- Libby Integration
- Schedules / Events
- Discord Rich Presence
- TouchPortal Integration
- Auth to different streaming platforms using Auth0
- Windows, Linux and Mac support

## To-Do
> A lot of things, more things than you would wanna know.

## UI Preview

<img style="border-radius: 25px;" src="/images/preview.gif"/>

## Use it

Dynamix is a static site, hosted on GitHub Pages: **https://orangopus.github.io/dynamix-toolbox/**

| Page | What it's for |
| --- | --- |
| `/` | Portfolio |
| `/overlays/` | 1920×1080 stream overlay for an OBS browser source. Add `?scene=brb` to pin one scene. |
| `/go/` | GoDECK: scene switcher and buttons for a phone or tablet |
| `/settings/` | Customise everything, with a live preview |

Settings save in your browser as you type, and other Dynamix pages open in the same browser update live. To use your settings somewhere else, such as OBS or another device, use **Share & backup** in settings. Each link carries the whole config. Tip: add `/go/` or `/settings/` as an OBS custom browser dock; it shares storage with OBS browser sources, so the overlay should follow along.

## Show your desktop's music (Hyprland and other Linux desktops)

The now-playing card can follow whatever plays on your computer: Spotify, mpv, a browser tab, anything that speaks MPRIS. `tools/dynamix-bridge` reads it over D-Bus and serves it on `127.0.0.1:7768`. It needs only Python 3 and systemd's `busctl`.

```sh
mkdir -p ~/.local/bin
curl -fsSL https://raw.githubusercontent.com/ORANGOPUS/dynamix-toolbox/master/tools/dynamix-bridge -o ~/.local/bin/dynamix-bridge
chmod +x ~/.local/bin/dynamix-bridge
```

Start it with Hyprland. On Omarchy, add `o.launch_on_start("dynamix-bridge")` to `~/.config/hypr/autostart.lua`; with a classic config, add `exec-once = dynamix-bridge` to `hyprland.conf`. Then, in **Customise → Overlay → Now playing**, choose **Desktop (Hyprland)**. You get the track, album art and a progress bar, and GoDECK gets play/pause/next buttons. If the bridge isn't running, the typed-in song shows instead.

Only Dynamix on GitHub Pages and `localhost` can read the bridge, so other sites can't see what you're playing. Hosting Dynamix elsewhere? Run `dynamix-bridge --allow-origin https://your.site`. With several players open, `--prefer spotify` picks one.

## Make your config the default

Export `config.json` from settings, commit it over the one in this repo, and push. The site rebuilds with it as everyone's default.

# Get Started

## Dev environment

```sh
npm install
npm run dev        # http://localhost:3001
npm run build      # static site in out/
```

Pushes to `master` deploy to GitHub Pages through `.github/workflows/pages.yml`.

# Support

We're available pretty much 24/7 on our [Discord](https://opus.ad/discord) so any support queries you can post in the `help` channel!

For our Help Centre: https://help.orangopus.org

# Contributing to the code

> This is an extremely experimental build. Please submit an issue/pull request if you find any errors.

# License

<img style="border-radius: 25px;" src="/images/authors.gif"/>

>This software is licensed under MIT and maintained by the Orangopus Team.
