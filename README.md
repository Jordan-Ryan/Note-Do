# Note-Do Shell

This project sets up a minimal React 18 + TypeScript front-end using Vite and styled-components. It includes a fixed ASOS-inspired header, collapsible sidebar, and accessible task timer widget that future pages can mount inside.

## Getting started

```bash
npm install
npm run dev
```

> **Note:** Installing dependencies requires access to the public npm registry.

## Available scripts

- `npm run dev` – start the Vite development server
- `npm run build` – build the production bundle
- `npm run preview` – preview the production build locally
- `npm run lint` – run TypeScript for type checking

## Deploying to GitHub Pages

This repository now ships with an automated GitHub Pages workflow. To publish changes:

1. In your repository settings, point **Pages** at “GitHub Actions”.
2. Push to `main` (or `work`) and the workflow in `.github/workflows/deploy.yml` will:
   - install dependencies,
   - run the production build (`npm run build`), and
   - upload the generated `dist/` output.
3. GitHub Pages serves the uploaded artifact with the correct base path (`/Note-Do/`).

You can also trigger the workflow manually from the **Actions** tab if you want to redeploy without a new commit.

## Project structure

```
src/
  App.tsx
  AppShell.tsx
  components/
    shell/
      Header.tsx
      Sidebar.tsx
      SidebarItem.tsx
    widgets/
      TaskTimer.tsx
  hooks/
    useMediaQuery.ts
  styles/
    GlobalStyle.ts
    tokens.css
```

Design tokens are defined in `src/styles/tokens.css` and consumed via CSS variables throughout the app.
