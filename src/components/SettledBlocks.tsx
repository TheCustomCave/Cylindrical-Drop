import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { BLOCK_SIZE } from '../constants';
import { TETROMINOS } from '../utils/tetrominos';

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

import { useTexture } from '@react-three/drei';

export function SettledBlocks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const grid = useGameStore(state => state.grid);
  const columns = useGameStore(state => state.columns);
  const rows = useGameStore(state => state.rows);
  const RADIUS = columns / (2 * Math.PI);
  const stoneTexture = useTexture('/stone_texture.png');

  useEffect(() => {
    if (stoneTexture) {
      stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
      stoneTexture.repeat.set(1, 1);
    }
  }, [stoneTexture]);

  const settledBlocks = useMemo(() => {
    const list: { r: number; c: number; color: string }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const type = grid[r][c];
        if (type) {
          list.push({ r, c, color: TETROMINOS[type].color });
        }
      }
    }
    return list;
  }, [grid, rows, columns]);

  useEffect(() => {
    if (!meshRef.current) return;
    
    meshRef.current.count = settledBlocks.length;

    settledBlocks.forEach((b, i) => {
      const angle = (b.c / columns) * Math.PI * 2;
      const x = RADIUS * Math.sin(angle);
      const z = RADIUS * Math.cos(angle);
      const y = b.r - (rows / 2);

      tempObject.position.set(x, y, z);
      tempObject.rotation.set(0, angle, 0);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
      
      // Give the settled blocks a warm stone tint for better color depth
      tempColor.set('#b8b0a8');
      meshRef.current!.setColorAt(i, tempColor);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [settledBlocks]);

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, rows * columns]}>
      <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]} />
      <meshStandardMaterial 
        map={stoneTexture} 
        bumpMap={stoneTexture}
        bumpScale={0.15}
        roughnessMap={stoneTexture}
        roughness={0.8} 
        metalness={0.1} 
      />
    </instancedMesh>
  );
}
