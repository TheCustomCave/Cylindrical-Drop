# Code Formatting & Style Rules

## Indentation & Spacing
- **Indentation:** 2 spaces. No tabs.
- **Max Line Length:** 100 characters.
- **Trailing Whitespace:** Always trim.
- **Newlines:** End files with a single newline.

## Naming Conventions
- **Files:** `PascalCase.tsx` for components, `camelCase.ts` for logic/utils.
- **Variables:** `camelCase` (e.g., `isMuted`, `score`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `BLOCK_SIZE`).
- **Interfaces/Types:** `PascalCase`. Prefer `interface` for component props and `type` for unions/aliases.

## Imports & Exports
- **Ordering:**
  1. React and core libraries (`react`, `three`).
  2. Third-party libraries (`@react-three/fiber`, `zustand`).
  3. Local stores and context.
  4. Local components.
  5. Local utils and constants.
  6. Styles and assets.
- **Exports:** Prefer named exports for utilities and components. Default export is allowed only for `App.tsx` or main entry points.

## Language Standards (TypeScript)
- **Strict Mode:** Required. Avoid `any` at all costs.
- **Explicitness:** Always define return types for complex functions and store actions.
- **Docstrings:** Use JSDoc for all public-facing utilities and store actions.

## Gold Standard Snippet
```tsx
import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';

/**
 * Renders a visual helper for the grid columns.
 */
export function GridHelper() {
  const columns = useGameStore(state => state.columns);
  const RADIUS = useMemo(() => columns / (2 * Math.PI), [columns]);

  return (
    <group>
      {/* Implementation */}
    </group>
  );
}
```
