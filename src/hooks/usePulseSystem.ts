// src/components/canvas/hooks/usePulseSystem.ts
import { useState, useCallback, useEffect } from "react";
import { ICrystal } from "@/interfaces/ICrystal";
import { CrystalAnimation } from "@/types";

export type PulsingState = {
  currentRadius: number;
  x: number;
  y: number;
  lastFrameTime: number;
} | null;

export const usePulseSystem = (
  playCrystalTone: (frequency: number) => void,
  crystals: ICrystal[]
) => {
  const [pulsingState, setPulsingState] = useState<PulsingState>(null);
  const [activatedCrystals, setActivatedCrystals] = useState<Set<number>>(
    new Set()
  );
  const [crystalAnimations, setCrystalAnimations] = useState<
    CrystalAnimation[]
  >([]);

  // Reset activated crystals when starting a new pulse
  useEffect(() => {
    if (pulsingState) {
      setActivatedCrystals(new Set());
      setCrystalAnimations([]);
    }
  }, [pulsingState]);

  const drawSoundPulse = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      const maxRadius = 1322; // diagonal of the canvas
      const progress = radius / maxRadius;
      const alpha = 0.6 * (1 - progress * 0.8);
      const lineWidth = 2 + progress * 30;

      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    },
    []
  );

  // Draw crystal pulse animations
  const drawCrystalPulse = useCallback(
    (ctx: CanvasRenderingContext2D, crystal: ICrystal, progress: number) => {
      if (!crystal) return;

      const { x, y, scale, color = "#ffffff" } = crystal;
      const baseSize = 64 * (scale ?? 1); // Crystal's base size

      // Start at 1/8 crystal size and grow to 2x crystal size
      const minRadius = baseSize * 0.125;
      const maxRadius = baseSize * 2;
      const currentRadius = minRadius + (maxRadius - minRadius) * progress;

      // Fade out as the pulse grows
      const alpha = 0.8 * (1 - progress);
      const lineWidth = 2 + progress * 6;

      ctx.save();
      // Use the crystal's color for its pulse
      ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${alpha})`;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.arc(x, y, currentRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    },
    []
  );

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex: string) => {
    // Default to white if no color is provided
    if (!hex || hex === "") return "255, 255, 255";

    // Remove # if present
    hex = hex.replace("#", "");

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  };

  const getDistance = useCallback(
    (x1: number, y1: number, x2: number, y2: number): number => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    []
  );

  // Draw all crystals with their animations
  const drawCrystals = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      currentTime: number,
      renderCrystal: (
        ctx: CanvasRenderingContext2D,
        crystal: ICrystal,
        isActivated: boolean
      ) => void
    ) => {
      // First draw non-activated crystals
      crystals.forEach((crystal, index) => {
        if (!activatedCrystals.has(index)) {
          renderCrystal(ctx, crystal, false);
        }
      });

      // Then draw activated crystals and their animations
      // This ensures animations appear on top
      activatedCrystals.forEach((index) => {
        const crystal = crystals[index];
        if (!crystal) return;

        // Draw the crystal itself
        renderCrystal(ctx, crystal, true);
      });

      // Draw all crystal animations
      crystalAnimations.forEach((animation) => {
        const crystal = crystals[animation.crystalIndex];
        if (!crystal) return;

        // Draw each pulse for this crystal
        animation.pulses.forEach((pulse) => {
          // Calculate progress for this pulse
          const pulseElapsed = currentTime - pulse.startTime;
          const pulseDuration = 500; // 0.5 seconds for each pulse animation
          const progress = Math.min(pulseElapsed / pulseDuration, 1.0);

          // Draw the pulse if it's still active
          if (progress < 1.0) {
            drawCrystalPulse(ctx, crystal, progress);
          }
        });
      });

      // Update crystal animations state by removing completed animations
      setCrystalAnimations((prev) => {
        // Filter out animations where all pulses are complete
        return prev
          .map((animation) => {
            // Filter out completed pulses
            const activePulses = animation.pulses.filter((pulse) => {
              const pulseElapsed = currentTime - pulse.startTime;
              return pulseElapsed < 500; // 0.5 seconds for each pulse
            });

            return {
              ...animation,
              pulses: activePulses,
            };
          })
          .filter((animation) => animation.pulses.length > 0);
      });
    },
    [crystals, activatedCrystals, crystalAnimations, drawCrystalPulse]
  );

  const updateAndDrawPulse = useCallback(
    (ctx: CanvasRenderingContext2D, currentTime: number) => {
      if (!pulsingState) return;

      const { x, y, currentRadius, lastFrameTime } = pulsingState;
      const deltaTime = (currentTime - lastFrameTime) / 1000;
      const pulseVelocity = 1322 / 2.5; // Full canvas diagonal in 2.5 seconds
      const newRadius = currentRadius + pulseVelocity * deltaTime;

      // Draw the pulse
      drawSoundPulse(ctx, x, y, newRadius);

      // Process crystal interactions
      crystals.forEach((crystal, index) => {
        if (!activatedCrystals.has(index)) {
          const distance = getDistance(x, y, crystal.x, crystal.y);

          if (currentRadius < distance && newRadius >= distance) {
            playCrystalTone(crystal.tone);

            setActivatedCrystals((prev) => {
              const newSet = new Set(prev);
              newSet.add(index);
              return newSet;
            });
          }
        }
      });

      // Check if pulse is complete
      if (newRadius >= 1322) {
        setPulsingState(null);
        setActivatedCrystals(new Set());
      } else {
        setPulsingState({
          x,
          y,
          currentRadius: newRadius,
          lastFrameTime: currentTime,
        });
      }
    },
    [
      pulsingState,
      crystals,
      activatedCrystals,
      drawSoundPulse,
      getDistance,
      playCrystalTone,
    ]
  );

  // Reset animations when needed (e.g., when starting a new pulse)
  const resetAnimations = useCallback(() => {
    setActivatedCrystals(new Set());
    setCrystalAnimations([]);
  }, []);

  return {
    pulsingState,
    setPulsingState,
    activatedCrystals,
    setActivatedCrystals,
    drawSoundPulse,
    updateAndDrawPulse,
    drawCrystals,
    resetAnimations,
  };
};
