# Architectural Guidelines

## Separation of Concerns
- **Logic vs. Presentation:** `gameStore.ts` contains the "brain" (collision, movement, state). React components are strictly for rendering and user input bridge.
- **Math Utilities:** Keep complex geometric calculations (cylindrical mapping) in pure functions within the store or dedicated `utils/` files.

## State Management (Zustand)
- **Store Structure:** Maintain a single flat store for high performance.
- **Selectivity:** Components should use selective state picks (`state => state.property`) to minimize re-renders.
- **Actions:** All logic that changes state must live inside the store as an action.

## Rendering Pattern
- **Instancing:** Use `THREE.InstancedMesh` for the settled block stack to keep draw calls low.
- **Updates:** Minimize `instanceMatrix.needsUpdate` calls to once per frame or only when the stack changes.

## Error Handling
- **Boundaries:** Use `ErrorBoundary` around the main `Canvas` to catch WebGL or React-Three-Fiber crashes.
- **Fail-safes:** Always check for `null` active pieces before running movement logic.
