import { Injectable, signal, computed } from '@angular/core';
import {
  ICrystal,
  CanvasMode,
  PlacementState,
  PulsingState,
  CrystalAnimation,
} from '../models/crystal.model';

@Injectable({ providedIn: 'root' })
export class CrystalService {
  // ─── Core state signals ────────────────────────────────────────────────────
  readonly crystals = signal<ICrystal[]>([]);
  readonly canvasMode = signal<CanvasMode>('Emit Pulse');
  readonly backgroundSrc = signal('images/abs158-floral.png');

  // Placement of a crystal currently being dragged onto the canvas
  readonly placementState = signal<PlacementState | null>(null);

  // Outward-expanding sound pulse emitted from a canvas click
  readonly pulsingState = signal<PulsingState | null>(null);

  // Which crystal indices have been activated by the current pulse
  readonly activatedCrystals = signal<Set<number>>(new Set());

  // Active visual pulse animations around activated crystals
  readonly crystalAnimations = signal<CrystalAnimation[]>([]);

  // ─── Derived signals ───────────────────────────────────────────────────────
  readonly placedCrystals = computed(() =>
    this.crystals().filter((c) => c.isPlaced)
  );

  readonly hasUnplacedCrystal = computed(() =>
    this.crystals().some((c) => !c.isPlaced)
  );

  // ─── Crystal actions ──────────────────────────────────────────────────────
  addCrystal(crystal: ICrystal): void {
    this.crystals.update((list) => [...list, crystal]);
  }

  finalizePlacement(
    crystalIndex: number,
    x: number,
    y: number,
    rotation: number,
    scale: number
  ): void {
    this.crystals.update((list) => {
      const updated = [...list];
      updated[crystalIndex] = { ...updated[crystalIndex], x, y, rotation, scale, isPlaced: true };
      return updated;
    });
    this.placementState.set(null);
    this.canvasMode.set('Emit Pulse');
  }

  // ─── Placement actions ────────────────────────────────────────────────────
  beginPlacement(crystalIndex: number, x: number, y: number): void {
    const crystal = this.crystals()[crystalIndex];
    this.canvasMode.set('Crystal Placement');
    this.placementState.set({
      isDragging: true,
      crystalIndex,
      x,
      y,
      rotation: crystal?.rotation ?? 0,
      scale: crystal?.scale ?? 1,
    });
  }

  movePlacement(x: number, y: number): void {
    this.placementState.update((s) => (s ? { ...s, x, y } : s));
  }

  endDrag(x: number, y: number): void {
    this.placementState.update((s) =>
      s ? { ...s, x, y, isDragging: false } : s
    );
  }

  rotateClockwise(): void {
    this.placementState.update((s) =>
      s ? { ...s, rotation: s.rotation + Math.PI / 8 } : s
    );
  }

  rotateCounterClockwise(): void {
    this.placementState.update((s) =>
      s ? { ...s, rotation: s.rotation - Math.PI / 8 } : s
    );
  }

  increaseScale(): void {
    this.placementState.update((s) =>
      s ? { ...s, scale: Math.min(2.0, s.scale + 0.1) } : s
    );
  }

  decreaseScale(): void {
    this.placementState.update((s) =>
      s ? { ...s, scale: Math.max(0.5, s.scale - 0.1) } : s
    );
  }

  // ─── Pulse actions ────────────────────────────────────────────────────────
  startPulse(x: number, y: number): void {
    this.pulsingState.set({
      x,
      y,
      currentRadius: 32,
      lastFrameTime: performance.now(),
    });
    this.activatedCrystals.set(new Set());
    this.crystalAnimations.set([]);
  }

  updatePulse(newRadius: number, now: number): void {
    this.pulsingState.update((s) =>
      s ? { ...s, currentRadius: newRadius, lastFrameTime: now } : s
    );
  }

  endPulse(): void {
    this.pulsingState.set(null);
    this.activatedCrystals.set(new Set());
  }

  activateCrystal(index: number, now: number): void {
    this.activatedCrystals.update((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    this.crystalAnimations.update((prev) => [
      ...prev,
      { crystalIndex: index, startTime: now, pulses: [{ progress: 0, startTime: now }] },
    ]);
  }

  pruneAnimations(now: number): void {
    const pulseDuration = 500;
    this.crystalAnimations.update((prev) =>
      prev
        .map((anim) => ({
          ...anim,
          pulses: anim.pulses.filter((p) => now - p.startTime < pulseDuration),
        }))
        .filter((anim) => anim.pulses.length > 0)
    );
  }
}
