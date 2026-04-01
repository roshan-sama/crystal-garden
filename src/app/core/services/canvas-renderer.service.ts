import { Injectable } from '@angular/core';
import {
  ICrystal,
  PulsingState,
  CrystalAnimation,
  CanvasFrameState,
} from '../models/crystal.model';

/** Maximum radius equals the canvas diagonal (1152×648). */
const MAX_RADIUS = 1322;
/** Pulse crosses the full diagonal in 2.5 s. */
const PULSE_VELOCITY = MAX_RADIUS / 2.5;
/** Duration of each crystal glow animation in ms. */
const CRYSTAL_PULSE_DURATION = 500;

@Injectable({ providedIn: 'root' })
export class CanvasRendererService {
  /** Initialise a canvas element to the garden dimensions. */
  setupCanvas(canvas: HTMLCanvasElement): void {
    canvas.width = 1152;
    canvas.height = 648;
  }

  /** Compute the next pulse radius for `deltaTime` seconds elapsed. */
  nextRadius(current: number, deltaTime: number): number {
    return current + PULSE_VELOCITY * deltaTime;
  }

  /** Draw a crystal image to the 2-D context at its current position. */
  drawCrystal(ctx: CanvasRenderingContext2D, crystal: ICrystal): void {
    const { x, y, scale = 1, rotation = 0, crystalCanvas } = crystal;
    if (!crystalCanvas) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(crystalCanvas, -56 * scale, -56 * scale, 128 * scale, 128 * scale);
    ctx.restore();
  }

  /** Draw the dashed placement indicator circle. */
  drawPlacementIndicator(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(x, y, 64, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  /** Draw the outward-expanding sound pulse ring. */
  drawSoundPulse(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
  ): void {
    const progress = radius / MAX_RADIUS;
    const alpha = 0.6 * (1 - progress * 0.8);
    const lineWidth = 2 + progress * 30;
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  /** Draw a crystal glow pulse animation ring at `progress` (0–1). */
  drawCrystalPulse(
    ctx: CanvasRenderingContext2D,
    crystal: ICrystal,
    progress: number
  ): void {
    const { x, y, scale = 1, color = '#ffffff' } = crystal;
    const baseSize = 64 * scale;
    const minR = baseSize * 0.125;
    const maxR = baseSize * 2;
    const radius = minR + (maxR - minR) * progress;
    const alpha = 0.8 * (1 - progress);
    const lineWidth = 2 + progress * 6;

    ctx.save();
    ctx.strokeStyle = `rgba(${hexToRgb(color)}, ${alpha})`;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Render a complete frame to the canvas.
   *
   * Layer order (bottom → top):
   *  1. Background image
   *  2. Non-activated crystals
   *  3. Activated crystals + glow pulses
   *  4. Sound-pulse ring (if active)
   *  5. Garden outline overlay
   *  6. Placement indicator (placement mode only)
   */
  drawFrame(
    ctx: CanvasRenderingContext2D,
    state: CanvasFrameState,
    backgroundImg: HTMLImageElement | null,
    backgroundOutline: HTMLImageElement | null
  ): void {
    const { width, height } = ctx.canvas;
    const {
      crystals,
      pulsingState,
      canvasMode,
      placementState,
      activatedCrystals,
      crystalAnimations,
      currentTime,
    } = state;

    ctx.clearRect(0, 0, width, height);

    // 1. Background
    if (backgroundImg) {
      ctx.drawImage(backgroundImg, 0, 0, width, height);
    }

    // 2 & 3. Crystals
    crystals.forEach((crystal, idx) => {
      if (!activatedCrystals.has(idx)) {
        this.drawCrystal(ctx, crystal);
      }
    });
    activatedCrystals.forEach((idx) => {
      const crystal = crystals[idx];
      if (crystal) this.drawCrystal(ctx, crystal);
    });

    // Crystal glow animations
    crystalAnimations.forEach((anim) => {
      const crystal = crystals[anim.crystalIndex];
      if (!crystal) return;
      anim.pulses.forEach((pulse) => {
        const elapsed = currentTime - pulse.startTime;
        const progress = Math.min(elapsed / CRYSTAL_PULSE_DURATION, 1);
        if (progress < 1) {
          this.drawCrystalPulse(ctx, crystal, progress);
        }
      });
    });

    // 4. Sound pulse
    if (pulsingState) {
      this.drawSoundPulse(
        ctx,
        pulsingState.x,
        pulsingState.y,
        pulsingState.currentRadius
      );
    }

    // 5. Garden outline
    if (backgroundOutline) {
      ctx.drawImage(backgroundOutline, 0, 0, width, height);
    }

    // 6. Placement indicator
    if (canvasMode === 'Crystal Placement' && placementState) {
      this.drawPlacementIndicator(ctx, placementState.x, placementState.y);
    }
  }

  /**
   * Detect which crystals the sound pulse has just passed over.
   * Returns the indices of newly activated crystals.
   */
  detectCollisions(
    pulsingState: PulsingState,
    newRadius: number,
    crystals: ICrystal[],
    alreadyActivated: Set<number>
  ): number[] {
    const activated: number[] = [];
    const { x, y, currentRadius } = pulsingState;

    crystals.forEach((crystal, idx) => {
      if (alreadyActivated.has(idx)) return;
      const dist = Math.hypot(crystal.x - x, crystal.y - y);
      if (currentRadius < dist && newRadius >= dist) {
        activated.push(idx);
      }
    });

    return activated;
  }
}

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
