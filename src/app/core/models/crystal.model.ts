export interface ICrystal {
  /** x coordinate of position on canvas */
  x: number;
  /** y coordinate of position on canvas */
  y: number;
  /** Scale, ranges 0.5 to 2.0 */
  scale?: number;
  /** Rotation in radians */
  rotation?: number;
  /** Hex Color of crystal */
  color: string;
  /** Simple tone in Hz */
  tone: number;
  /** Canvas of the customized crystal */
  crystalCanvas?: HTMLCanvasElement;
  /** Path to the path of the base image of crystal */
  spritePath: string;
  /** Whether or not this crystal is placed */
  isPlaced: boolean;
}

export type CanvasMode = 'Crystal Placement' | 'Emit Pulse';

export interface PlacementState {
  isDragging: boolean;
  crystalIndex: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export interface PulsingState {
  currentRadius: number;
  x: number;
  y: number;
  lastFrameTime: number;
}

export interface CrystalAnimationPulse {
  progress: number;
  startTime: number;
}

export interface CrystalAnimation {
  crystalIndex: number;
  startTime: number;
  pulses: CrystalAnimationPulse[];
}

/** Snapshot passed from earlyRead → write phase of afterRenderEffect */
export interface CanvasFrameState {
  crystals: ICrystal[];
  pulsingState: PulsingState | null;
  canvasMode: CanvasMode;
  placementState: PlacementState | null;
  activatedCrystals: Set<number>;
  crystalAnimations: CrystalAnimation[];
  currentTime: number;
}
