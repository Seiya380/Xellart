# Xellart

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A minimalist, browser-based tool that applies a real-time pixel art effect to images and live camera feeds. Upload a photo or point your webcam at something and watch it turn into blocky, retro pixel art — with a single slider.

## Features

- **Image mode** — upload any image and pixelate it on the fly
- **Camera mode** — apply the pixelation effect to your live webcam feed in real time
- **Adjustable pixel size** — slider from 1 (original) to 100 (maximum pixelation)
- **Front/rear camera switch** — toggle between front-facing and environment cameras on mobile
- **Download** — save the pixelated image or a camera screenshot as PNG

## Usage

No installation required. Open `index.html` in any modern browser.

1. **Image mode** (default): click **Choose Image**, select a photo, then drag the **Pixelation** slider.
2. **Camera mode**: click **Camera**, allow webcam access, then drag the slider to see the live effect.
3. Click **Download** (image mode) or the camera icon (camera mode) to save the result as a PNG.

## How it works

Pixelation is achieved with a two-pass canvas technique:
1. The image is drawn at a fraction of its original resolution (controlled by the slider).
2. That small version is scaled back up to the full canvas size with `imageSmoothingEnabled = false`, producing the characteristic blocky look.

## Tech Stack

| Technology | Role |
|---|---|
| HTML / CSS / JavaScript | Core (no build step) |
| Canvas API | Image rendering and pixelation |
| MediaDevices API | Live camera feed |

## Running locally

```bash
# Any static file server works, e.g.:
npx serve .
# Then open http://localhost:3000
```

Camera access requires a secure context (HTTPS or `localhost`). Simply opening `index.html` via `file://` may restrict camera access depending on your browser.

## License

[MIT](LICENSE) — Copyright (c) 2026 Seiya
