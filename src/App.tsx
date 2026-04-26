import { useEffect, useRef, Suspense, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDrag } from '@use-gesture/react';
import { ContactShadows, Environment } from '@react-three/drei';
import { CylinderGrid } from './components/CylinderGrid';
import { SettledBlocks } from './components/SettledBlocks';
import { ActivePiece } from './components/ActivePiece';
import { ParticleSystem } from './components/ParticleSystem';
import { useGameStore } from './store/gameStore';
import { BLOCK_SIZE } from './constants';
import './index.css';

function GameBoard() {
  const targetRotation = useGameStore(state => state.targetRotation);
  const rows = useGameStore(state => state.rows);
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
    <group position={[0, -rows / 8, 0]}>
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
  const score = useGameStore(state => state.score);
  const linesCleared = useGameStore(state => state.linesCleared);
  const columns = useGameStore(state => state.columns);
  const rows = useGameStore(state => state.rows);
  const startingFill = useGameStore(state => state.startingFill);
  const restartGame = useGameStore(state => state.restartGame);
  const volume = useGameStore(state => state.volume);
  const setVolume = useGameStore(state => state.setVolume);
  const RADIUS = columns / (2 * Math.PI);

  const [selectedCols, setSelectedCols] = useState(columns);
  const [selectedFill, setSelectedFill] = useState(startingFill);

  // Auto-zoom based on RADIUS - adjusted for better framing on large cylinders
  const cameraZ = 35 + RADIUS * 2.2;

  const speedMultiplier = 1 + Math.min(0.5, Math.floor(linesCleared / 10) * 0.01);
  const dropInterval = 1000 / speedMultiplier;

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
    if (paused) return;
    const interval = setInterval(() => {
      moveDown();
    }, dropInterval);

    return () => clearInterval(interval);
  }, [moveDown, dropInterval, paused]);

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
      <div {...bind()} style={{ width: '100vw', height: '100vh', backgroundColor: '#111', touchAction: 'none' }}>
        <Canvas camera={{ position: [0, 5, cameraZ], fov: 45 }} shadows>
          <color attach="background" args={['#0d0d12']} />
          <fog attach="fog" args={['#0d0d12', 45, 120]} />
          
          <Environment preset="apartment" environmentIntensity={0.5} />

          <ambientLight intensity={0.8} />
          
          {/* Front Light for general visibility */}
          <directionalLight position={[0, 0, 50]} intensity={0.6} />
          
          {/* Main Key Light - Reduced intensity to prevent glare */}
          <directionalLight 
            position={[20, 30, 20]} 
            intensity={1.0} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          
          {/* Piece Follow Light - Reduced intensity and moved back to soften glare */}
          {activePiece && (
            <pointLight 
              position={[0, (activePiece.row - 2) - (rows / 2) + 4, RADIUS + 8]} 
              intensity={1.5} 
              distance={30}
              color={activePiece.color}
            />
          )}
          
          {/* Rim Light for separation */}
          <directionalLight position={[-15, 10, -10]} intensity={1.2} color="#5599ff" />
          
          {/* Warm Bottom Glow */}
          <pointLight position={[0, -rows/2, 0]} intensity={1.2} color="#ffaa44" distance={30} />

          <Suspense fallback={null}>
            <group position={[0, 4, 0]}>
              <GameBoard />
              <ContactShadows
                position={[0, -rows / 2 - 0.1, 0]}
                opacity={0.3}
                scale={40}
                blur={2.5}
                far={10}
              />
            </group>
          </Suspense>
        </Canvas>

        {/* UI Overlays are now handled inside the Control Panel below */}


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

        {/* HUD */}
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          color: 'white',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          zIndex: 100,
          pointerEvents: 'none',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '15px 25px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <div style={{ 
            fontSize: '12px', 
            textTransform: 'uppercase', 
            letterSpacing: '2px', 
            opacity: 0.6,
            marginBottom: '4px'
          }}>
            Current Score
          </div>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            lineHeight: '1',
            marginBottom: '12px'
          }}>
            {score.toLocaleString()}
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            fontSize: '14px', 
            textTransform: 'uppercase', 
            letterSpacing: '1px',
            opacity: 0.8 
          }}>
            <span>Lines: <strong>{linesCleared}</strong></span>
            <span>Speed: <strong>+{((speedMultiplier - 1) * 100).toFixed(0)}%</strong></span>
          </div>
        </div>

        {/* Control Panel (Settings + Buttons) */}
        <div style={{
          position: 'absolute',
          top: '30px',
          right: '30px',
          color: 'white',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '20px',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          minWidth: '200px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '14px', opacity: 0.7, fontWeight: 'bold' }}>Cylinder Size</span>
            <select 
              value={selectedCols} 
              onChange={(e) => setSelectedCols(parseInt(e.target.value))}
              style={{ 
                background: 'rgba(20, 20, 25, 0.9)', 
                color: 'white', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '6px', 
                padding: '5px 8px',
                cursor: 'pointer'
              }}
            >
              <option value="32" style={{ background: '#1a1a24', color: 'white' }}>Small (32)</option>
              <option value="64" style={{ background: '#1a1a24', color: 'white' }}>Standard (64)</option>
              <option value="96" style={{ background: '#1a1a24', color: 'white' }}>Large (96)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '14px', opacity: 0.7, fontWeight: 'bold' }}>Starting Fill</span>
            <select 
              value={selectedFill} 
              onChange={(e) => setSelectedFill(e.target.value as any)}
              style={{ 
                background: 'rgba(20, 20, 25, 0.9)', 
                color: 'white', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '6px', 
                padding: '5px 8px',
                cursor: 'pointer'
              }}
            >
              <option value="none" style={{ background: '#1a1a24', color: 'white' }}>Empty</option>
              <option value="v-shape" style={{ background: '#1a1a24', color: 'white' }}>V-Shape</option>
              <option value="random" style={{ background: '#1a1a24', color: 'white' }}>Randomized</option>
              <option value="spiral" style={{ background: '#1a1a24', color: 'white' }}>Spiral Path</option>
            </select>
          </div>

          <button 
            onClick={() => {
              import('./utils/audio').then(m => m.startBackgroundMusic());
              restartGame(selectedCols, 25, selectedFill);
            }}
            style={{
              padding: '12px',
              background: '#44aaff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 15px rgba(68, 170, 255, 0.3)'
            }}
          >
            New Game
          </button>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '5px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); togglePause(); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
                title={paused ? 'Resume' : 'Pause'}
              >
                {paused ? '▶' : '⏸'}
              </button>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  toggleMute();
                  import('./utils/audio').then(m => m.updateAudioSettings());
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setVolume(volume - 0.1);
                  import('./utils/audio').then(m => m.updateAudioSettings());
                }}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                -
              </button>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${volume * 100}%`, background: '#44aaff', borderRadius: '2px' }} />
              </div>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setVolume(volume + 0.1);
                  import('./utils/audio').then(m => m.updateAudioSettings());
                }}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
