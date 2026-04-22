import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private storage = inject(StorageService);
  private audioContext: AudioContext | null = null;

  private initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playWin() {
    if (!this.storage.soundEnabled()) return;
    this.initAudio();
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // A two-tone ascending sound (success)
    this.playTone(523.25, now, 0.1); // C5
    this.playTone(659.25, now + 0.1, 0.2); // E5
  }

  playFail() {
    if (!this.storage.soundEnabled()) return;
    this.initAudio();
    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // A low descending buzz (fail)
    this.playTone(220.00, now, 0.15, 'sawtooth'); // A3
    this.playTone(110.00, now + 0.05, 0.2, 'sawtooth'); // A2
  }

  private playTone(freq: number, start: number, duration: number, type: OscillatorType = 'sine') {
    const ctx = this.audioContext!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    
    gain.gain.setValueAtTime(0.1, start);
    gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + duration);
  }
}
