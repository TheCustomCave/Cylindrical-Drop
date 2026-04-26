import { useGameStore } from '../store/gameStore';

let audioCtx: AudioContext | null = null;
let bgOsc: OscillatorNode | null = null;
let bgGain: GainNode | null = null;

const getVolume = () => {
  const { isMuted, volume } = useGameStore.getState();
  return isMuted ? 0 : volume;
};

export const startBackgroundMusic = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  if (bgOsc) return;

  const t = audioCtx.currentTime;
  bgOsc = audioCtx.createOscillator();
  bgGain = audioCtx.createGain();

  bgOsc.type = 'triangle';
  bgOsc.frequency.setValueAtTime(40, t); // Low resonant hum
  
  // Create a slow pulsing filter for "atmospheric" feel
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, t);
  
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.value = 0.1; // Slow pulse
  lfoGain.gain.value = 200;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  bgGain.gain.setValueAtTime(getVolume() * 0.1, t); // Very quiet

  bgOsc.connect(filter);
  filter.connect(bgGain);
  bgGain.connect(audioCtx.destination);

  bgOsc.start();
};

export const updateAudioSettings = () => {
  if (bgGain && audioCtx) {
    bgGain.gain.setTargetAtTime(getVolume() * 0.1, audioCtx.currentTime, 0.1);
  }
};

export const playClunk = () => {
  const vol = getVolume();
  if (vol === 0) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const t = audioCtx.currentTime;
  
  // 1. Low Thud (Sine wave dropping in pitch)
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
  
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start(t);
  osc.stop(t + 0.1);

  // 2. High frequency crunchy noise (Stone scraping/clacking)
  const bufferSize = audioCtx.sampleRate * 0.05; // 50ms of noise
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = buffer;
  
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 800;

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(vol * 0.6, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  noiseSource.start(t);
};

export const playClearSound = () => {
  const vol = getVolume();
  if (vol === 0) return;
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  
  // Deep stone crumble rumble
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(60, t);
  osc.frequency.exponentialRampToValueAtTime(10, t + 0.8);
  
  gain.gain.setValueAtTime(vol * 0.8, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start(t);
  osc.stop(t + 0.8);

  // Big rocky crash noise
  const bufferSize = audioCtx.sampleRate * 0.5;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = buffer;
  
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 400;

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(vol, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  noiseSource.start(t);
};
