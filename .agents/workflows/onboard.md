---
description: Onboarding Workflow - Guided tour of the codebase.
---

# Onboarding Workflow

Providing a high-level walkthrough of **Cylindrical Drop**:

1. **Entry Point:** Start at `src/main.tsx` and `src/App.tsx`. `App` contains the `Canvas` and the main game loop (`useEffect` for gravity).
2. **The Brain:** Explore `src/store/gameStore.ts`. This is where all the physics, rotation, and line clearing logic lives.
3. **Rendering:** 
   - `SettledBlocks.tsx`: See how we render thousands of blocks efficiently.
   - `ActivePiece.tsx`: Understand how the falling piece is decoupled from the cylinder rotation to "lock" to the front.
4. **Key Concept:** The `RADIUS` is dynamic and derived from the number of columns.
5. **Setup:** 
   - `npm install`
   - `npm run dev`
6. **Gotchas:** 
   - The grid "spins" underneath the active piece.
   - All components must use the lowercase `rows`/`columns` from the store, not the constants.
