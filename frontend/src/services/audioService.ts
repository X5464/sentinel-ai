
import { RiskLevel } from '../types';

let audioContext: AudioContext | null = null;

const getContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Must be called on user interaction (click/touch/key)
export const initAudio = () => {
  const ctx = getContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};

const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number, volume: number = 0.1) => {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  
  // Smooth attack and release envelope
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

export const playRiskSound = (level: RiskLevel) => {
  try {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    switch (level) {
      case RiskLevel.SAFE:
        // Ascending major arpeggio (Pleasant Chime)
        playTone(523.25, 'sine', 0.8, now, 0.1);     // C5
        playTone(659.25, 'sine', 0.8, now + 0.15, 0.1); // E5
        playTone(783.99, 'sine', 1.2, now + 0.3, 0.1);  // G5
        break;

      case RiskLevel.LOW:
        // Gentle neutral notification (Soft Bell)
        playTone(440, 'sine', 0.6, now, 0.1);
        playTone(880, 'sine', 0.3, now, 0.05); // Overtone
        break;

      case RiskLevel.MEDIUM:
        // Cautionary descending interval (Triangle wave)
        playTone(440, 'triangle', 0.4, now, 0.08); // A4
        playTone(349.23, 'triangle', 0.6, now + 0.2, 0.08); // F4
        break;

      case RiskLevel.HIGH:
        // Distinct alert (Sawtooth)
        playTone(300, 'sawtooth', 0.2, now, 0.08);
        playTone(300, 'sawtooth', 0.2, now + 0.25, 0.08);
        break;

      case RiskLevel.CRITICAL:
        // Urgent warning (Lower pitch, rapid pulses)
        playTone(150, 'square', 0.15, now, 0.06);
        playTone(150, 'square', 0.15, now + 0.15, 0.06);
        playTone(150, 'square', 0.15, now + 0.30, 0.06);
        break;
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};