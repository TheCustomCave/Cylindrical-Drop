import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { ROWS, COLS, RADIUS, BLOCK_SIZE } from '../constants';

import { useTexture } from '@react-three/drei';

export function ActivePiece() {
  const activePiece = useGameStore(state => state.activePiece);
  const stoneTexture = useTexture('/stone_texture.png');

  useEffect(() => {
    if (stoneTexture) {
      stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
      stoneTexture.repeat.set(2, 2);
    }
  }, [stoneTexture]);

  // We only render individual meshes for the active piece (max 4 blocks typically)
  // This is highly performant and avoids complex InstancedMesh updates for moving objects
  const blocks = useMemo(() => {
    if (!activePiece) return [];
    
    const list = [];
    for (let y = 0; y < activePiece.shape.length; y++) {
      for (let x = 0; x < activePiece.shape[y].length; x++) {
        if (activePiece.shape[y][x]) {
          const centerOffset = -Math.floor(activePiece.shape[0].length / 2);
          const visualCol = x + centerOffset; 
          const angle = (visualCol / COLS) * Math.PI * 2;
          
          const px = RADIUS * Math.sin(angle);
          const pz = RADIUS * Math.cos(angle);
          const py = (activePiece.row - y) - (ROWS / 2);
          
          list.push({ x: px, y: py, z: pz, angle, color: activePiece.color });
        }
      }
    }
    return list;
  }, [activePiece]);

  if (!activePiece) return null;

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} rotation={[0, b.angle, 0]}>
          <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]} />
          {/* Use the stone texture with the piece's color, no emissive to keep the 'chilled' look */}
          <meshStandardMaterial map={stoneTexture} color={b.color} roughness={0.6} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}
