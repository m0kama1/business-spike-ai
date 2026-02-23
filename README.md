# Business Spike AI (GitHub Pages Ready)

This project is converted from `BusinessSpikeAI.jsx` to a Vite + React app ready for GitHub Pages.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages (GitHub Actions)

1. Push this folder as the root of your GitHub repository.
2. In GitHub repo settings:
   - Go to **Settings > Pages**.
   - Set **Source** to **GitHub Actions**.
3. Push to `main`; workflow `.github/workflows/deploy.yml` will deploy automatically.

## Notes

- `vite.config.js` uses `base: './'` so static assets resolve correctly on GitHub Pages.
- App source is in `src/App.jsx`.
