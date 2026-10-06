![](https://i.imgur.com/R0gZo17.png)

A mix of tools at your disposal. Integrating all the services out there into one seamless web-stack.

Coded with 🧡 by [🐙](https://orangop.us)

<a href="https://www.producthunt.com/posts/dynamix-toolbox?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-dynamix-toolbox" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=281386&theme=dark" alt="Dynamix Toolbox - A self-hosted sandbox to boost your workflow. | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

## Features
- Dynamix Overlays (/overlays)
- GoDECK (/go)
- Dynamix Portfolio (/)
- Settings panel (/settings) with themes, live preview and shareable links
- Runs anywhere static: built on Next.js and React, hosted on GitHub Pages

## Planned Features
- Dynamically updated buttons
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
| `/settings/` | Edit everything: profile, theme, scenes, events, now playing, GoDECK buttons |

Settings save in your browser as you type, and other Dynamix pages open in the same browser update live. To use your settings somewhere else, such as OBS or another device, use **Share & backup** in settings. Each link carries the whole config. Tip: add `/go/` or `/settings/` as an OBS custom browser dock; it shares storage with OBS browser sources, so the overlay should follow along.

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
