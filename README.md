# Lookalike

Photograph a page of problems, pick 5, 10 or 15 questions and a difficulty, and get a fresh multiple-choice quiz on the same skills from Gemini. The model is instructed never to solve or reveal answers to the problems on your page.

## Files

- `index.html`, `styles.css`, `app.js`: the app
- `manifest.webmanifest`: install metadata (name, colors, icons, standalone display)
- `sw.js`: service worker (offline app shell; API calls always go to the network)
- `icons/`: 192, 512, maskable 512, and Apple touch icons

## 1. Try it locally

```
python3 -m http.server 8080
```

Open http://localhost:8080. Service workers work on localhost. On a phone the app needs HTTPS, so host it (step 2) before testing there.

## 2. Host it over HTTPS

Upload the folder to any static host: Netlify (drag and drop), Cloudflare Pages, Vercel, or a GitHub Pages user site (`username.github.io`). Put it at the root of a domain if you can, because the Android wrapper links to the site through `/.well-known/assetlinks.json` at the domain root.

## 3. Get a Gemini key

Create one at https://aistudio.google.com/apikey, open the app, tap the gear, and paste it in. The default model is `gemini-3.6-flash`; change it in Settings if Google retires it.

## 4. Make the APK

**Option A: PWABuilder (easiest)**
1. Go to https://www.pwabuilder.com and enter your site's URL.
2. Choose Package for Stores, then Android, and download the zip.
3. The zip has a signed `.apk`, an `.aab`, and an `assetlinks.json`. Upload `assetlinks.json` to `https://your-site/.well-known/assetlinks.json`. Without it the app shows a browser address bar.
4. On your phone, allow installs from your file manager or browser, then open the `.apk`.

**Option B: Bubblewrap CLI**
```
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://your-site/manifest.webmanifest
bubblewrap build
```
It prints the SHA-256 fingerprint to use in `assetlinks.json`.

**Option C: Capacitor (bundles the files inside the APK, no hosting needed)**
```
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init Lookalike com.example.lookalike --web-dir=.
npx cap add android
npx cap sync
npx cap open android
```
Build the APK from Android Studio.

## Updating

Edit the files, then bump `VERSION` in `sw.js` so phones drop the old cache.

## About the API key

Entering your key in Settings is fine for an app on your own phone. If you share the APK with other people, put the key behind a small proxy (for example a Cloudflare Worker), set `CONFIG.proxyUrl` at the top of `app.js`, and restrict the key in Google AI Studio.
