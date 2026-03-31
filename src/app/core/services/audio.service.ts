import { Injectable } from '@angular/core';
import * as Tone from 'tone';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private synth: Tone.Synth | null = null;
  private started = false;

  /** Initialise the synthesiser. Call once after the first user interaction. */
  private init(): void {
    if (this.synth) return;
    this.synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1.5 },
    }).toDestination();
  }

  /** Resume Tone.js audio context on the first user gesture. */
  async resume(): Promise<void> {
    if (this.started) return;
    this.started = true;
    await Tone.start();
    this.init();
  }

  playCrystalTone(frequency: number): void {
    if (!this.synth) return;
    const duration = Math.max(0.5, 1.5 - frequency / 1000);
    this.synth.triggerAttackRelease(frequency, duration);
  }

  dispose(): void {
    this.synth?.dispose();
    this.synth = null;
  }
}
