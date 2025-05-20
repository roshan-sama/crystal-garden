// src/components/canvas/hooks/useCrystalPlacement.ts
import { useState, useCallback, RefObject } from "react";
import { CanvasMode } from "../interfaces/ICanvasMode";

export type PlacementState = {
  isDragging: boolean;
  crystalIndex: number;
  x: number;
  y: number;
  rotation: number; // in radians
  scale: number;
} | null;

export const useCrystalPlacement = (
  canvasRef: RefObject<HTMLCanvasElement>,
  canvasMode: CanvasMode,
  setCanvasMode: (mode: CanvasMode) => void,
  onCrystalPlacementDone?: (
    crystalIndex: number,
    x: number,
    y: number,
    rotation: number,
    scale: number
  ) => void
) => {
  const [placementState, setPlacementState] = useState<PlacementState>(null);

  const getEventCoordinates = useCallback(
    (event: React.PointerEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },
    [canvasRef]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (canvasMode !== "Crystal Placement" || !placementState) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.setPointerCapture(event.pointerId);

      const coords = getEventCoordinates(event);
      if (!coords) return;

      setPlacementState({
        ...placementState,
        x: coords.x,
        y: coords.y,
      });
    },
    [canvasMode, placementState, canvasRef, getEventCoordinates]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (canvasMode !== "Crystal Placement" || !placementState?.isDragging)
        return;

      const coords = getEventCoordinates(event);
      if (!coords) return;

      setPlacementState({
        ...placementState,
        x: coords.x,
        y: coords.y,
      });
    },
    [canvasMode, placementState, getEventCoordinates]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (canvasMode !== "Crystal Placement" || !placementState) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.releasePointerCapture(event.pointerId);

      const coords = getEventCoordinates(event);
      if (!coords) return;

      setPlacementState({
        ...placementState,
        x: coords.x,
        y: coords.y,
        isDragging: false,
      });
    },
    [canvasMode, placementState, canvasRef, getEventCoordinates]
  );

  const handleDoneButtonClick = useCallback(() => {
    if (!placementState) return;

    if (onCrystalPlacementDone) {
      onCrystalPlacementDone(
        placementState.crystalIndex,
        placementState.x,
        placementState.y,
        placementState.rotation,
        placementState.scale
      );
    }

    setPlacementState(null);
    setCanvasMode("Emit Pulse");
  }, [placementState, onCrystalPlacementDone, setCanvasMode]);

  // New functions for rotation and scaling
  const rotateClockwise = useCallback(() => {
    if (!placementState) return;

    setPlacementState({
      ...placementState,
      rotation: placementState.rotation + Math.PI / 8, // Rotate by 22.5 degrees
    });
  }, [placementState]);

  const rotateCounterClockwise = useCallback(() => {
    if (!placementState) return;

    setPlacementState({
      ...placementState,
      rotation: placementState.rotation - Math.PI / 8, // Rotate by 22.5 degrees
    });
  }, [placementState]);

  const increaseScale = useCallback(() => {
    if (!placementState) return;

    setPlacementState({
      ...placementState,
      scale: Math.min(2.0, placementState.scale + 0.1), // Limit maximum scale
    });
  }, [placementState]);

  const decreaseScale = useCallback(() => {
    if (!placementState) return;

    setPlacementState({
      ...placementState,
      scale: Math.max(0.5, placementState.scale - 0.1), // Limit minimum scale
    });
  }, [placementState]);

  return {
    placementState,
    setPlacementState,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDoneButtonClick,
    rotateClockwise,
    rotateCounterClockwise,
    increaseScale,
    decreaseScale,
  };
};
