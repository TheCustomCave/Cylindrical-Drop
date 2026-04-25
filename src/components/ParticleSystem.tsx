import { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

const tempObj = new THREE.Object3D();

function Explosion({ rowId, rowNum, onComplete }: { rowId: number, rowNum: number, onComplete: () => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const life = useRef(1.0);
  const isDead = useRef(false);
  
  const columns = useGameStore(state => state.columns);
  const rows = useGameStore(state => state.rows);
  const RADIUS = columns / (2 * Math.PI);
  
  // Create particles erupting from the cleared row
  const particles = useMemo(() => {
    return Array.from({ length: 128 }, () => {
      const angle = Math.random() * Math.PI * 2;
      // Start near the cylinder wall
      const r = RADIUS + (Math.random() - 0.5) * 0.5;
      const x = r * Math.sin(angle);
      const z = r * Math.cos(angle);
      // Row physical Y
      const y = rowNum - (rows / 2) + (Math.random() - 0.5);
      
      // Velocity outward and upward
      const vx = x * 0.5 + (Math.random() - 0.5) * 2;
      const vy = Math.random() * 5;
      const vz = z * 0.5 + (Math.random() - 0.5) * 2;

      return { x, y, z, vx, vy, vz, rot: Math.random() * Math.PI, vRot: (Math.random() - 0.5) * 10 };
    });
  }, [rowNum]);

  useFrame((_, delta) => {
    if (!meshRef.current || isDead.current) return;
    
    life.current -= delta * 1.5;
    if (life.current <= 0) {
      isDead.current = true;
      onComplete();
      return;
    }

    if (materialRef.current) {
      materialRef.current.opacity = life.current;
    }

    particles.forEach((p, i) => {
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;
      // Gravity
      p.vy -= 9.8 * delta;
      p.rot += p.vRot * delta;

      tempObj.position.set(p.x, p.y, p.z);
      tempObj.rotation.set(p.rot, p.rot, p.rot);
      // scale down as it dies
      const s = life.current * 0.3;
      tempObj.scale.set(s, s, s);
      tempObj.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObj.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, particles.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial ref={materialRef} color="#ffffff" transparent opacity={1.0} />
    </instancedMesh>
  );
}

export function ParticleSystem() {
  const explosions = useGameStore(state => state.explosions);
  const removeExplosion = useGameStore(state => state.removeExplosion);

  return (
    <group>
      {explosions.map(e => (
        <Explosion key={e.id} rowId={e.id} rowNum={e.row} onComplete={() => removeExplosion(e.id)} />
      ))}
    </group>
  );
}
