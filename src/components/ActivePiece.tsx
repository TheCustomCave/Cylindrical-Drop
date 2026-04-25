import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { BLOCK_SIZE } from '../constants';

import { useTexture } from '@react-three/drei';

export function ActivePiece() {
  const activePiece = useGameStore(state => state.activePiece);
  const columns = useGameStore(state => state.columns);
  const rows = useGameStore(state => state.rows);
  const RADIUS = columns / (2 * Math.PI);
  const stoneTexture = useTexture('/stone_texture.png');

  useEffect(() => {
    if (stoneTexture) {
      stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
      stoneTexture.repeat.set(1, 1); // Larger grain for better visibility
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
          const angle = (visualCol / columns) * Math.PI * 2;
          
          const px = RADIUS * Math.sin(angle);
          const pz = RADIUS * Math.cos(angle);
          const py = (activePiece.row - y) - (rows / 2);
          
          list.push({ x: px, y: py, z: pz, angle, color: activePiece.color });
        }
      }
    }
    return list;
  }, [activePiece, columns, rows, RADIUS]);

  if (!activePiece) return null;

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} rotation={[0, b.angle, 0]}>
          <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]} />
          {/* Use bumpMap and roughnessMap to make the stone texture feel tangible */}
          <meshStandardMaterial 
            map={stoneTexture} 
            bumpMap={stoneTexture}
            bumpScale={0.15}
            roughnessMap={stoneTexture}
            color={b.color} 
            roughness={0.8} 
            metalness={0.1} 
          />
        </mesh>
      ))}
    </group>
  );
}
