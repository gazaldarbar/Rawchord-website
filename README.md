# RawChord — Music Production & Recording Studio

A responsive one-page website for **RawChord**, designed for mobile, tablet and desktop.

## Stack
- React
- TypeScript
- Vite
- Framer Motion
- Lucide React
- Pure CSS responsive design

## Quick start

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

The production files are created in `dist/`.

## Before publishing — IMPORTANT

Open `src/data.ts` and replace:

- `phone`
- `email`
- `instagram`
- `youtube`
- `address`
- `mapsQuery`

For the exact studio map pin, replace `mapsQuery` with the exact address or latitude/longitude.

## Adding your real music

Open `src/data.ts` and update the `works` array. The visual player is already built. You can later connect each item to your hosted audio file or a streaming service URL.

## Deploying to GitHub Pages

### Option A — easiest
1. Create a new GitHub repository.
2. Upload all project files.
3. Install dependencies and build locally using `npm run build`.
4. Deploy the generated `dist` folder to GitHub Pages.

### Option B — GitHub Actions
A deployment workflow can be added after the repository name is known, because GitHub Pages paths can differ depending on whether the site uses a custom domain.

## Structure

```text
src/
├── assets/
│   └── rawchord-logo.png
├── App.tsx
├── data.ts
├── main.tsx
└── styles.css
```

## Design direction
- Black foundation
- Lavender accent inspired by the RawChord logo
- High-contrast white typography
- Premium glass / depth treatment
- Horizontal album showcase inspired by the supplied references
