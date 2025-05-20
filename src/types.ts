export type CanvasMode = "Crystal Placement" | "Emit Pulse";

export type CrystalAnimation = {
  crystalIndex: number;
  startTime: number;
  pulses: Array<{
    progress: number; // 0 to 1 representing animation progress
    startTime: number;
  }>;
};
