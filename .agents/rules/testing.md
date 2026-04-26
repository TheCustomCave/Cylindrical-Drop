# Testing Guidelines & Standards

## Framework
- **Recommended:** [Vitest](https://vitest.dev/) for unit and logic testing.
- **Visual Testing:** Manual verification via browser for 3D rendering and animations.

## Directory Structure
- Place tests in `src/__tests__/` or adjacent to the file being tested with a `.test.ts` or `.spec.ts` suffix.

## Coverage Requirements
- **Game Logic:** 100% coverage for collision detection, line clearing, and scoring math in `gameStore.ts`.
- **Utilities:** Full coverage for tetromino transformations and audio mapping.

## Mocking Strategy
- Mock `zustand` if necessary, though testing the actual store is preferred for logic validation.
- Mock `three.js` globals if they interfere with headless environments.

## Example Test
```ts
import { describe, it, expect } from 'vitest';
import { generateInitialGrid } from '../store/gameStore';

describe('Grid Generation', () => {
  it('should generate an empty grid when fill is none', () => {
    const grid = generateInitialGrid(25, 64, 'none');
    expect(grid.flat().every(cell => cell === null)).toBe(true);
  });
});
```
