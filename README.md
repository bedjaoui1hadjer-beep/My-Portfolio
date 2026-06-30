# Hadjer Bedjaoui — Portfolio

Personal portfolio website built with vanilla HTML, CSS, and JavaScript, featuring an interactive Three.js background scene.

## Overview

This is a single-page portfolio site showcasing projects, skills, and a downloadable resume. It includes a layered Three.js 3D scene rendered behind the main content as a visual overlay.

## Project Structure

```
My Portfolio/
├── My_Portfolio.html          # Main HTML page
├── style.css                  # All styling
├── script.js                  # Core site interactions
├── three-scene.js             # Three.js background scene (ES module)
├── WIRING.md                  # Notes on how the Three.js canvas is wired into the page
├── Resume_Bedjaoui_Hadjer.pdf # Downloadable resume
├── images/
│   ├── img.jpg
│   ├── Portfolio.png
│   ├── DZHouse.png             # Project screenshot — DZHouse
│   └── PSYRA.png               # Project screenshot — PSYRA
└── assets/
    └── models/                 # 3D models used by the Three.js scene
```

## Tech Stack

- **HTML5 / CSS3** — page structure and styling, no framework
- **JavaScript (vanilla)** — UI interactions in `script.js`
- **Three.js** (loaded via CDN import map, no build step) — 3D background scene in `three-scene.js`

## Running Locally

No build tools or npm install required. Because `three-scene.js` is loaded as an ES module, the page must be served over HTTP (not opened directly via `file://`) for the module imports to resolve correctly.

From the project folder, run a simple local server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/My_Portfolio.html` in your browser.

## Notes

- See `WIRING.md` for details on how the Three.js canvas overlay was integrated without modifying the existing HTML/CSS/script.js structure.
- Three.js is loaded from a CDN via an import map — an internet connection is required for the 3D background to render.
