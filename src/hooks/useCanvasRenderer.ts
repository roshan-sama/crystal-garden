import { ICrystal } from "@/interfaces/ICrystal";
import { useState, useCallback, RefObject } from "react";

export const useCanvasRenderer = (
  canvasRef: RefObject<HTMLCanvasElement>,
  backgroundImage: string
) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(
    null
  );
  const [backgroundOutline, setBackgroundOutline] =
    useState<HTMLImageElement | null>(null);

  const initialize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas ref not found in initialize function");
      return;
    }

    canvas.width = 1152;
    canvas.height = 648;

    // Load the background image if provided
    if (backgroundImage) {
      const img = new Image();
      img.src = backgroundImage;
      img.onload = () => {
        setBackgroundImg(img);
        setImgLoaded(true);
      };
      img.onerror = (err) => {
        console.error("Error loading the background image:", err);
      };

      const outlineImg = new Image();
      outlineImg.src = "./images/garden-outline.png";
      outlineImg.onload = () => {
        setBackgroundOutline(outlineImg);
      };
    }
  }, [backgroundImage, canvasRef]);

  // Utility functions for drawing crystals, etc.
  const drawCrystal = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      crystal: ICrystal,
      isActivated: boolean
    ) => {
      const { x, y, scale = 1, rotation = 0, crystalCanvas } = crystal;

      if (!crystalCanvas) return;

      ctx.save();

      // Translate to crystal center, rotate, and translate back
      ctx.translate(x, y);
      ctx.rotate(rotation);

      ctx.drawImage(
        crystalCanvas,
        x - 56 * scale, //-64 * scale,
        y - 56 * scale, //-64 * scale,
        128 * scale,
        128 * scale
      );

      // Reset transformations
      ctx.restore();
    },
    []
  );

  const drawPlacementIndicator = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(x, y, 64, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();
    },
    []
  );

  return {
    imgLoaded,
    backgroundImg,
    backgroundOutline,
    initialize,
    drawCrystal,
    drawPlacementIndicator,
  };
};
