# Zwave Studio

An iPhone web app for making custom **wallpapers** and **home screen widgets**. Plain HTML/CSS/JS — no build step, no dependencies, works offline once installed.

## Features

**Backgrounds**
- Generative styles: Mesh, Gradient, Waves, Bokeh, Bauhaus, Rings, Dunes — plus Photo (blur + color tint)
- 16 palettes, custom colors, "New layout" reseeding, and a Randomize button
- Grain, darken and vignette finishes; optional text overlay (placed below the clock, centered, or at the bottom)
- Exports at the exact pixel size of your iPhone (auto-detected, or pick a model)

**Widgets**
- Quote, Date, Month calendar, Countdown, Label/emoji and Photo widgets
- Small, medium and large sizes, exported at 3× (510×510, 1092×510, 1092×1146)
- Backgrounds: gradient, solid, or **Wallpaper / Frosted / Smoke**, which use the exact slice of your wallpaper behind a top-left widget so it blends in
- **Live widgets:** copy a generated script for the free [Scriptable](https://scriptable.app) app; it updates itself daily

**Preview & Saved**
- Home Screen and Lock Screen mock-ups with your wallpaper and widget
- Save designs to an on-device library (IndexedDB) and reopen them later

## Using it on iPhone

1. Open the site in Safari, then **Share → Add to Home Screen**.
2. **Wallpaper:** Export → Save to Photos → in Photos, **Share → Use as Wallpaper**.
3. **Widget image:** Export → Save to Photos → put it in its own album → add a **Photos** widget and choose that album.
4. **Live widget:** Copy Scriptable script → paste into a new Scriptable script → add a Scriptable widget and select it.

## Hosting

Any static host works. A workflow in `.github/workflows/pages.yml` deploys to GitHub Pages on pushes to `main` — enable it under **Settings → Pages → Source: GitHub Actions**.

Run locally:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

When you change files, bump `VERSION` in `sw.js` so installed copies pick up the update.
