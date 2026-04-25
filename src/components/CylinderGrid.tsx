import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { BLOCK_SIZE } from '../constants';

export function CylinderGrid() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const columns = useGameStore(state => state.columns);
  const rows = useGameStore(state => state.rows);
  const RADIUS = columns / (2 * Math.PI);

  const blocks = useMemo(() => {
    const list = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const angle = (c / columns) * Math.PI * 2;
        const x = RADIUS * Math.sin(angle);
        const z = RADIUS * Math.cos(angle);

        // Center the grid vertically around y=0
        const y = r - (rows / 2);

        list.push({ row: r, col: c, x, y, z, angle });
      }
    }
    return list;
  }, [rows, columns, RADIUS]);

  // Update instance matrices to position/rotate all cubes in a single draw call
  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();

    blocks.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      // Rotate the block so it aligns with the cylinder circumference
      dummy.rotation.set(0, b.angle, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [blocks]);

  return (
    <group>
      {/* Clean cylinder grid without diagonals */}
      <lineSegments>
        <edgesGeometry args={[new THREE.CylinderGeometry(RADIUS, RADIUS, rows, columns, rows, true)]} />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </lineSegments>
      
      {/* Subtle bottom floor ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -rows / 2, 0]}>
        <ringGeometry args={[RADIUS - 0.5, RADIUS + 0.1, columns]} />
        <meshStandardMaterial color="#444" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
