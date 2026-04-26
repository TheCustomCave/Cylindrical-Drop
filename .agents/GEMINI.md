# 🌑 Cylindrical Drop — Master Guide

## Project Overview
Cylindrical Drop is a premium, immersive 3D cylindrical Tetris experience. It re-imagines the classic falling-block puzzle on a rotating 3D surface, emphasizing tactile materials, high-end aesthetics, and smooth mechanical feedback.

## Tech Stack
- **Runtimes:** Node.js 20+
- **Frameworks:** React 18+ (Vite)
- **3D Engine:** [React Three Fiber](https://github.com/pmndrs/react-three-fiber) & [Three.js](https://threejs.org/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Styling:** Vanilla CSS (Glassmorphism)
- **Languages:** TypeScript 5.x (Strict Mode)

## Architecture & Directory Map
- `src/store/`: Central state via Zustand. Contains all game logic, collision detection, and grid manipulation.
- `src/components/`: React Three Fiber components.
  - `ActivePiece.tsx`: Renders the currently falling piece.
  - `SettledBlocks.tsx`: Uses `InstancedMesh` for high-performance rendering of the stack.
  - `CylinderGrid.tsx`: Visual wireframe and structural indicators.
- `src/utils/`: Helper functions for audio synthesis and tetromino definitions.
- `src/constants.ts`: Global tunables (BLOCK_SIZE, default ROWS/COLS).
- `public/`: Assets including the chunky stone texture and audio icons.

## Development Commands
- `npm run dev`: Start local development server (Vite).
- `npm run build`: Build production bundle.
- `npm run lint`: Run ESLint checks.

## Coding Conventions
- **Naming:** CamelCase for components and hooks, camelCase for functions/variables, PascalCase for types/interfaces.
- **Imports:** Absolute-like imports from `src/`. Order: React/Third-party -> Local Components -> Local Utils -> Local Assets.
- **State:** Use `useGameStore` selectively to avoid unnecessary re-renders. Prefer atomic selectors.
- **Performance:** Use `InstancedMesh` for all repetitive geometric elements (blocks, particles).

## Critical Rules
- **IMPORTANT:** Never use hardcoded constants for grid dimensions in components; always read `rows` and `columns` from the store.
- **IMPORTANT:** All 3D coordinates must be relative to the `RADIUS` calculation: `columns / (2 * Math.PI)`.
- **IMPORTANT:** Preserve the "chilled" stone aesthetic—avoid high-saturation emissive glows or jarring primary colors.
