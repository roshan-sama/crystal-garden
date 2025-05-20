// src/components/canvas/CanvasContainer.tsx
import { ICrystal } from "@/interfaces/ICrystal";
import React, { useRef, useEffect, useState, RefObject } from "react";
import { useCanvasRenderer } from "../../hooks/useCanvasRenderer";
import { usePulseSystem } from "../../hooks/usePulseSystem";
import { useCrystalPlacement } from "../../hooks/useCrystalPlacement";
import { useAudioSystem } from "../../hooks/useAudioSystem";
import { CanvasMode } from "../../interfaces/ICanvasMode";
import PlacementControls from "../ui/PlacementControls";

interface CanvasProps {
  backgroundImage: string;
  crystals: ICrystal[];
  onCrystalPlacementDone?: (crystalIndex: number, x: number, y: number) => void;
}

const CanvasContainer: React.FC<CanvasProps> = ({
  backgroundImage,
  crystals,
  onCrystalPlacementDone,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(
    null
  ) as unknown as RefObject<HTMLCanvasElement>;

  if (!canvasRef) {
    console.error("canvas reference not found");
    return;
  }

  const [canvasMode, setCanvasMode] = useState<CanvasMode>("Emit Pulse");

  // Extract audio system to its own hook
  const { synth, playCrystalTone } = useAudioSystem();

  // Extract rendering logic to its own hook
  const {
    imgLoaded,
    backgroundImg,
    backgroundOutline,
    initialize,
    drawCrystal,
    drawPlacementIndicator,
  } = useCanvasRenderer(canvasRef, backgroundImage);

  // Extract pulse system to its own hook
  const {
    pulsingState,
    setPulsingState,
    activatedCrystals,
    updateAndDrawPulse,
    drawCrystals,
  } = usePulseSystem(playCrystalTone, crystals);

  // Extract crystal placement to its own hook
  const {
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
  } = useCrystalPlacement(
    canvasRef,
    canvasMode,
    setCanvasMode,
    onCrystalPlacementDone
  );

  // Initialize the canvas
  useEffect(() => {
    initialize();
  }, [backgroundImage, initialize]);

  // Auto-switch to Crystal Placement mode when a new crystal is added
  useEffect(() => {
    const newCrystalIndex = crystals.findIndex((crystal) => !crystal.isPlaced);

    if (newCrystalIndex !== -1 && canvasMode !== "Crystal Placement") {
      setCanvasMode("Crystal Placement");
      if (!canvasRef.current) return;

      setPlacementState({
        isDragging: true,
        crystalIndex: newCrystalIndex,
        x: crystals[newCrystalIndex].x || canvasRef.current.width / 2,
        y: crystals[newCrystalIndex].y || canvasRef.current.height / 2,
        rotation: crystals[newCrystalIndex].rotation || 0,
        scale: crystals[newCrystalIndex].scale || 1.0,
      });
    }
  }, [crystals, canvasMode, setPlacementState]);

  // Handle canvas click for emitting pulse
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasMode !== "Emit Pulse") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Start a new pulse
    setPulsingState({
      x,
      y,
      currentRadius: 32,
      lastFrameTime: performance.now(),
    });
  };

  // Main animation loop using the drawing systems
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context || !canvas) return;

    const animate = (time: number) => {
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      if (backgroundImg && imgLoaded) {
        context.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
      }

      // Draw crystals with animations
      drawCrystals(context, time, drawCrystal);

      // Draw active pulse if there is one
      if (pulsingState) {
        updateAndDrawPulse(context, time);
      }

      // Draw the outline on top
      if (backgroundOutline) {
        context.drawImage(backgroundOutline, 0, 0, canvas.width, canvas.height);
      }

      // Draw placement indicator if in placement mode
      if (canvasMode === "Crystal Placement" && placementState) {
        drawPlacementIndicator(context, placementState.x, placementState.y);
      }

      // Schedule next frame
      animationFrameId = window.requestAnimationFrame(animate);
    };

    let animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    backgroundImg,
    backgroundOutline,
    imgLoaded,
    pulsingState,
    activatedCrystals,
    crystals,
    canvasMode,
    placementState,
    drawCrystals,
    updateAndDrawPulse,
    drawCrystal,
    drawPlacementIndicator,
  ]);

  // // Extract the drawing logic to a separate function that coordinates all drawing operations
  // const drawFrame = (context: CanvasRenderingContext2D, time: number) => {
  //   // Draw all crystals
  //   drawCrystals(context);

  //   // Draw pulse if active
  //   if (pulsingState) {
  //     updateAndDrawPulse(context, time);
  //   }

  //   // Draw placement indicator
  //   if (canvasMode === "Crystal Placement" && placementState) {
  //     drawPlacementIndicator(context, placementState.x, placementState.y);
  //   }
  // };

  // These component-specific drawing functions would be defined here
  // or moved to the appropriate hooks

  return (
    <div style={{ position: "relative", width: "1152px", height: "648px" }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          cursor: canvasMode === "Crystal Placement" ? "crosshair" : "default",
        }}
      />

      {canvasMode === "Crystal Placement" && placementState && (
        <PlacementControls
          onDone={handleDoneButtonClick}
          onRotateClockwise={rotateClockwise}
          onRotateCounterClockwise={rotateCounterClockwise}
          onIncreaseScale={increaseScale}
          onDecreaseScale={decreaseScale}
        />
      )}
    </div>
  );
};

export default CanvasContainer;
