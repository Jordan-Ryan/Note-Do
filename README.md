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
- `npm run build` – type-check and build for production
- `npm run preview` – preview the production build locally
- `npm run lint` – run TypeScript for type checking

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
