# Xlo.builds — Speaking Practice Website

A lightweight static website for English-speaking practice. It works locally in a browser and can be hosted for free with GitHub Pages or Netlify.

## Run in VS Code
1. Extract this folder.
2. Open the folder in VS Code.
3. Install the **Live Server** extension (optional but convenient).
4. Right-click `index.html` → **Open with Live Server**. You can also open `index.html` directly in a browser.

## Features
- Spinning topic wheel and category filter.
- 1,200+ beginner-friendly, open-ended conversation prompts.
- Quick-start mode: fixed 1-minute preparation, then adjustable speaking timer.
- Deep Dive mode: adjustable research timer first (default 5 minutes), then fixed 1-minute preparation, then adjustable speaking timer.
- Timers can be paused and reset; timer lengths can be adjusted from 1 to 30 minutes (preparation stays fixed).
- Topic copy button and optional sound cues.
- Responsive layout for phones and desktop.

## Free hosting (recommended: GitHub Pages)
1. Create a GitHub repository named `xlo-builds` (or any name).
2. Upload `index.html`, `style.css`, `script.js`, `topics.js`, and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
5. Wait for deployment. GitHub will show the live website URL in the Pages section.

No backend, paid API, or database is required. Google Fonts are optional styling; the site itself runs without a server. If you want a custom `.com` domain, that domain normally costs extra; the hosted site can remain free on the GitHub Pages URL.

## Customise topics
Open `topics.js`. It contains the complete topic bank as an array of `[category, prompt]` pairs. Add new pairs using the same format.
