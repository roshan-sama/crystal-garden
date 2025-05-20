// src/components/canvas/hooks/useAudioSystem.ts
import { useRef, useEffect } from "react";
import * as Tone from "tone";

export const useAudioSystem = () => {
  const synth = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    // Initialize the synthesizer
    synth.current = new Tone.Synth({
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1.5,
      },
    }).toDestination();

    // Start Tone.js audio context on user interaction
    const startAudio = () => {
      if (Tone.context.state !== "running") {
        Tone.start();
      }
      document.removeEventListener("click", startAudio);
    };
    document.addEventListener("click", startAudio);

    return () => {
      document.removeEventListener("click", startAudio);
      synth.current?.dispose();
    };
  }, []);

  const playCrystalTone = (frequency: number) => {
    if (!synth.current) return;

    // Convert frequency to note duration based on its value
    const duration = Math.max(0.5, 1.5 - frequency / 1000);
    synth.current.triggerAttackRelease(frequency, duration);
  };

  return {
    synth,
    playCrystalTone,
  };
};
