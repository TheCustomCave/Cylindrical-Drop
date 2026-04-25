import { useEffect, useRef, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDrag } from '@use-gesture/react';
import { ContactShadows } from '@react-three/drei';
import { CylinderGrid } from './components/CylinderGrid';
import { SettledBlocks } from './components/SettledBlocks';
import { ActivePiece } from './components/ActivePiece';
import { ParticleSystem } from './components/ParticleSystem';
import { useGameStore } from './store/gameStore';
import { ROWS, RADIUS } from './constants';
import './index.css';

function GameBoard() {
  const targetRotation = useGameStore(state => state.targetRotation);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Smoothly interpolate the visual rotation of the cylinder to the target rotation
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotation,
      15, // Smoothness lambda
      delta
    );
  });

  return (
    // Shift the entire game board down to create headroom for spawning
    <group position={[0, -ROWS / 8, 0]}>
      {/* The cylinder and settled blocks spin smoothly based on drag */}
      <group ref={groupRef}>
        <CylinderGrid />
        <SettledBlocks />
      </group>

      {/* Row clearing explosions */}
      <ParticleSystem />

      {/* The falling piece stays decoupled so it visually locks to the front */}
      <ActivePiece />
    </group>
  );
}

function App() {
  const spawnPiece = useGameStore(state => state.spawnPiece);
  const moveDown = useGameStore(state => state.moveDown);
  const rotateCylinder = useGameStore(state => state.rotateCylinder);
  const rotateByOneColumn = useGameStore(state => state.rotateByOneColumn);
  const rotateActivePiece = useGameStore(state => state.rotateActivePiece);
  const activePiece = useGameStore(state => state.activePiece);
  const paused = useGameStore(state => state.paused);
  const togglePause = useGameStore(state => state.togglePause);
  const isMuted = useGameStore(state => state.isMuted);
  const toggleMute = useGameStore(state => state.toggleMute);

  useEffect(() => {
    // Spawn initial piece if one doesn't exist for testing logic
    if (!activePiece) {
      spawnPiece();
    }
  }, [activePiece, spawnPiece]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') moveDown();
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') rotateActivePiece();
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') rotateByOneColumn(1);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') rotateByOneColumn(-1);
      if (e.key === ' ') spawnPiece();
      if (e.key === 'p' || e.key === 'P') togglePause();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveDown, spawnPiece, rotateActivePiece, rotateByOneColumn, togglePause]);

  // Gravity game loop
  useEffect(() => {
    const interval = setInterval(() => {
      moveDown();
    }, 1000); // Drop 1 row every second

    return () => clearInterval(interval);
  }, [moveDown]);

  // Bind pointer drag to rotate the cylinder
  const bind = useDrag(({ delta: [dx], down, tap }) => {
    if (tap) {
      rotateActivePiece();
    } else {
      rotateCylinder(dx, down);
    }
  }, { filterTaps: true });

  return (
    <ErrorBoundary>
      <div {...bind()} style={{ width: '100vw', height: '100vh', backgroundColor: '#222', touchAction: 'none' }}>
        <Canvas camera={{ position: [0, 5, 45], fov: 45 }} shadows>
          <color attach="background" args={['#1a1a1a']} />
          <fog attach="fog" args={['#1a1a1a', 30, 80]} />

          <ambientLight intensity={0.5} />

          {/* Main Key Light */}
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.0}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

          {/* Piece Follow Light (Highlight the active piece texture) */}
          {activePiece && (
            <pointLight
              position={[0, (activePiece.row - 2) - (ROWS / 2) + 4, RADIUS + 2]}
              intensity={2.0}
              distance={15}
              color={activePiece.color}
            />
          )}

          {/* Rim Light for separation */}
          <directionalLight position={[-10, 10, -10]} intensity={0.6} color="#44aaff" />

          {/* Warm Fill Light */}
          <pointLight position={[-15, -5, 5]} intensity={0.3} color="#ffaa44" />

          <Suspense fallback={null}>
            <group position={[0, 4, 0]}>
              <GameBoard />
              <ContactShadows
                position={[0, -ROWS / 2 - 0.1, 0]}
                opacity={0.3}
                scale={40}
                blur={2.5}
                far={10}
              />
            </group>
          </Suspense>
        </Canvas>

        {/* UI Overlays */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 100,
          pointerEvents: 'auto'
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); togglePause(); }}
            style={{
              padding: '10px 20px',
              fontSize: '18px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              backdropFilter: 'blur(5px)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              marginRight: '10px'
            }}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            style={{
              padding: '10px 20px',
              fontSize: '18px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              backdropFilter: 'blur(5px)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        </div>

        {paused && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '8px',
            pointerEvents: 'none',
            textShadow: '0 0 20px rgba(255,255,255,0.5)'
          }}>
            Paused
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
