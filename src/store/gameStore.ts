import { create } from 'zustand';
import { ROWS, COLS } from '../constants';
import { type BlockType, randomTetromino } from '../utils/tetrominos';

export type GridCell = BlockType | null;

interface ActivePiece {
  type: BlockType;
  shape: number[][];
  color: string;
  row: number; // Row position of top-left of shape (higher number = higher in cylinder)
  col: number; // Col position of top-left of shape
}

interface GameState {
  grid: GridCell[][];
  activePiece: ActivePiece | null;
  targetRotation: number; // The exact rotation we want to be at (snapped or dragged)
  explosions: { id: number; row: number }[];
  paused: boolean;
  spawnPiece: () => void;
  rotateCylinder: (deltaX: number, isDragging: boolean) => void;
  rotateByOneColumn: (dir: 1 | -1) => void;
  rotateActivePiece: () => void;
  moveDown: () => void;
  removeExplosion: (id: number) => void;
  togglePause: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  score: number;
  linesCleared: number;
  columns: number;
  rows: number;
  startingFill: 'v-shape' | 'none' | 'random' | 'spiral';
  restartGame: (cols?: number, rows?: number, fill?: 'v-shape' | 'none' | 'random' | 'spiral') => void;
  volume: number;
  setVolume: (v: number) => void;
}

const getBlockCol = (pieceCol: number, shape: number[][], x: number, cols: number) => {
  const centerOffset = -Math.floor(shape[0].length / 2);
  return (((pieceCol + x + centerOffset) % cols) + cols) % cols;
};

const checkCollision = (piece: ActivePiece, grid: GridCell[][], dr = 0, targetCol?: number) => {
  const rows = grid.length;
  const cols = grid[0].length;
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const r = piece.row - y + dr;
        const c = getBlockCol(targetCol !== undefined ? targetCol : piece.col, piece.shape, x, cols);

        // Hit the bottom floor
        if (r < 0) return true;
        // Hit another settled block
        if (r < rows && grid[r][c] !== null) return true;
      }
    }
  }
  return false;
};

const generateInitialGrid = (rows: number, cols: number, fill: 'v-shape' | 'none' | 'random' | 'spiral') => {
  // Pre-calculate random heights for the 'random' fill mode
  const randomHeights = fill === 'random' 
    ? Array.from({ length: cols }, () => Math.floor(Math.random() * 12)) 
    : [];

  return Array.from({ length: rows }, (_, r) => {
    return Array.from({ length: cols }, (_, c) => {
      if (fill === 'none') return null;
      if (fill === 'v-shape') {
        const distFromFront = Math.min(c, cols - c);
        const height = Math.floor(distFromFront / 0.8);
        return r < height ? 'L' : null;
      }
      if (fill === 'random') {
        return r < randomHeights[c] ? 'L' : null;
      }
      if (fill === 'spiral') {
        // Spiral path: fill up to row 18, but leave a path open
        // The empty path shifts by 2 columns every row
        const emptyPathCol = (r * 3) % cols;
        const distFromPath = Math.min(Math.abs(c - emptyPathCol), cols - Math.abs(c - emptyPathCol));
        if (r < 18 && distFromPath > 1.5) {
          return 'L';
        }
      }
      return null;
    });
  });
};

export const useGameStore = create<GameState>((set, get) => ({
  columns: COLS,
  rows: ROWS,
  startingFill: 'v-shape',
  grid: generateInitialGrid(ROWS, COLS, 'v-shape'),
  activePiece: null,
  targetRotation: 0,
  explosions: [],
  paused: false,
  isMuted: false,
  volume: 0.5,
  score: 0,
  linesCleared: 0,

  setVolume: (v: number) => set({ volume: Math.max(0, Math.min(1, v)) }),
  
  restartGame: (cols, rows, fill) => set(state => {
    const newCols = cols ?? state.columns;
    const newRows = rows ?? state.rows;
    const newFill = fill ?? state.startingFill;
    return {
      columns: newCols,
      rows: newRows,
      startingFill: newFill,
      grid: generateInitialGrid(newRows, newCols, newFill),
      activePiece: null,
      score: 0,
      linesCleared: 0,
      targetRotation: 0,
      explosions: []
    };
  }),

  toggleMute: () => set(state => ({ isMuted: !state.isMuted })),
  togglePause: () => set(state => ({ paused: !state.paused })),

  removeExplosion: (id: number) => set((state) => ({
    explosions: state.explosions.filter(e => e.id !== id)
  })),

  spawnPiece: () => {
    const piece = randomTetromino();
    set((state) => {
      const anglePerCol = (Math.PI * 2) / COLS;
      const colShift = Math.round(-state.targetRotation / anglePerCol);
      const spawnCol = ((colShift % COLS) + COLS) % COLS;

      let finalShape = piece.shape;
      const randomRotations = Math.floor(Math.random() * 4);
      for (let i = 0; i < randomRotations; i++) {
        finalShape = finalShape[0].map((_, index) => finalShape.map(r => r[index]).reverse());
      }

      return {
        activePiece: {
          type: piece.type,
          shape: finalShape,
          color: piece.color,
          row: state.rows - 1, 
          col: spawnCol,
        }
      };
    });
  },

  rotateActivePiece: () => set((state) => {
    if (!state.activePiece || state.paused) return state;

    const { shape } = state.activePiece;
    const newShape = shape[0].map((_, index) => shape.map(r => r[index]).reverse());

    const testPiece = { ...state.activePiece, shape: newShape };
    
    // Check if the rotated piece collides (bounds check or block overlap)
    // We try original position, then try kicking left/right by 1
    let kickedCol = state.activePiece.col;
    let collision = checkCollision(testPiece, state.grid, 0, kickedCol);
    
    if (collision) {
      kickedCol = (state.activePiece.col - 1 + state.columns) % state.columns;
      collision = checkCollision(testPiece, state.grid, 0, kickedCol);
    }
    if (collision) {
      kickedCol = (state.activePiece.col + 1) % state.columns;
      collision = checkCollision(testPiece, state.grid, 0, kickedCol);
    }

    if (!collision) {
      // Move audio call to a safe context
      setTimeout(() => {
        try { import('../utils/audio').then(m => m.playClunk()); } catch(e) {}
      }, 0);
      return {
        activePiece: { ...testPiece, col: kickedCol }
      };
    }
    return state;
  }),

  rotateByOneColumn: (dir: 1 | -1) => set((state) => {
    if (state.paused) return state;
    const anglePerCol = (Math.PI * 2) / state.columns;
    const newTargetRotation = state.targetRotation + dir * anglePerCol;
    
    const newColShift = Math.round(-newTargetRotation / anglePerCol);
    const newCol = ((newColShift % state.columns) + state.columns) % state.columns;

    // Check collision for the new column
    if (state.activePiece && checkCollision(state.activePiece, state.grid, 0, newCol)) {
      return state;
    }

    return {
      targetRotation: newTargetRotation,
      activePiece: state.activePiece ? { ...state.activePiece, col: newCol } : null
    };
  }),

  rotateCylinder: (deltaX: number, isDragging: boolean) => set((state) => {
    if (state.paused) return state;
    const sensitivity = 0.01;
    let newTargetRotation = state.targetRotation + deltaX * sensitivity;
    
    const anglePerCol = (Math.PI * 2) / state.columns;
    
    if (!isDragging) {
      // Snap to the absolute nearest column boundary
      newTargetRotation = Math.round(newTargetRotation / anglePerCol) * anglePerCol;
    }

    if (!state.activePiece) {
      return { targetRotation: newTargetRotation };
    }

    // Use current unbounded column shift to define our current absolute frame of reference
    const currentColShift = Math.round(-state.targetRotation / anglePerCol);
    const idealRotation = -currentColShift * anglePerCol;

    // Determine absolute adjacent columns
    const leftCol = (((currentColShift - 1) % state.columns) + state.columns) % state.columns;
    const rightCol = (((currentColShift + 1) % state.columns) + state.columns) % state.columns;

    const blockedLeft = checkCollision(state.activePiece, state.grid, 0, leftCol);
    const blockedRight = checkCollision(state.activePiece, state.grid, 0, rightCol);

    // Hard clamp rotation if we are pushing against a blocked adjacent column
    if (blockedLeft && newTargetRotation > idealRotation) {
      newTargetRotation = idealRotation;
    }
    if (blockedRight && newTargetRotation < idealRotation) {
      newTargetRotation = idealRotation;
    }

    // Determine the new logical column based on the TARGET rotation
    const newColShift = Math.round(-newTargetRotation / anglePerCol);
    const newCol = ((newColShift % state.columns) + state.columns) % state.columns;

    return {
      targetRotation: newTargetRotation,
      activePiece: {
        ...state.activePiece,
        col: newCol,
      }
    };
  }),

  moveDown: () => set((state) => {
    if (!state.activePiece || state.paused) return state;

    if (checkCollision(state.activePiece, state.grid, -1)) {
      // 1) Settle the piece into the grid
      const newGrid = state.grid.map(row => [...row]);
      for (let y = 0; y < state.activePiece.shape.length; y++) {
        for (let x = 0; x < state.activePiece.shape[y].length; x++) {
          if (state.activePiece.shape[y][x]) {
            const r = state.activePiece.row - y;
            const c = getBlockCol(state.activePiece.col, state.activePiece.shape, x, state.columns);
            if (r >= 0 && r < state.rows) {
              newGrid[r][c] = state.activePiece.type;
            }
          }
        }
      }

      // Move audio call to a safe context
      setTimeout(() => {
        try { import('../utils/audio').then(m => m.playClunk()); } catch(e) {}
      }, 0);

      // 2) Clear full rows
      const clearedIndices: number[] = [];
      const filteredGrid = newGrid.filter((row, idx) => {
        const isFull = row.every(cell => cell !== null);
        if (isFull) clearedIndices.push(idx);
        return !isFull;
      });

      let newExplosions = state.explosions;
      let newScore = state.score;
      let newLinesCleared = state.linesCleared;

      if (clearedIndices.length > 0) {
        setTimeout(() => {
          try { import('../utils/audio').then(m => m.playClearSound()); } catch(e) {}
        }, 0);
        const bursts = clearedIndices.map(r => ({ id: Date.now() + Math.random(), row: r }));
        newExplosions = [...state.explosions, ...bursts];
        
        // Update score: columns per line
        newLinesCleared += clearedIndices.length;
        newScore += clearedIndices.length * state.columns;
      }

      // Add fresh empty rows to the top to maintain ROWS count
      for (let i = 0; i < clearedIndices.length; i++) {
        filteredGrid.push(Array(state.columns).fill(null));
      }

      // 3) Spawn a new piece immediately aligned with the current cylinder rotation
      const piece = randomTetromino();
      const anglePerCol = (Math.PI * 2) / state.columns;
      const colShift = Math.round(-state.targetRotation / anglePerCol);
      const spawnCol = ((colShift % state.columns) + state.columns) % state.columns;

      // Handle Game Over condition if spawn overlaps
      const newActivePiece = {
        type: piece.type,
        shape: piece.shape,
        color: piece.color,
        row: state.rows - 1, 
        col: spawnCol,
      };

      if (checkCollision(newActivePiece, filteredGrid, 0)) {
        // Game Over! Reset with current config
        return {
          grid: generateInitialGrid(state.rows, state.columns, state.startingFill),
          activePiece: newActivePiece,
          explosions: newExplosions,
          score: 0,
          linesCleared: 0
        }
      }

      return {
        grid: filteredGrid,
        activePiece: newActivePiece,
        explosions: newExplosions,
        score: newScore,
        linesCleared: newLinesCleared
      };
    }

    // No collision, normal gravity step down
    return {
      activePiece: {
        ...state.activePiece,
        row: state.activePiece.row - 1,
      }
    };
  }),
}));
