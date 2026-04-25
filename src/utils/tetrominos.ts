export type BlockType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Tetromino {
  shape: number[][];
  color: string;
}

export const TETROMINOS: Record<BlockType, Tetromino> = {
  I: { shape: [[1, 1, 1, 1]], color: '#00ffff' }, // Cyan
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000ff' }, // Blue
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#ff7f00' }, // Orange
  O: { shape: [[1, 1], [1, 1]], color: '#ffff00' }, // Yellow
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff00' }, // Green
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#800080' }, // Purple
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff0000' }  // Red
};

export const randomTetromino = () => {
  const tetrominos: BlockType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  const randBlock = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return { type: randBlock, ...TETROMINOS[randBlock] };
};
