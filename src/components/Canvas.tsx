import React, { useRef, useEffect, useState } from "react";

const Canvas: React.FC<{ backgroundImage: string }> = (props) => {
  const { backgroundImage } = props;
  const canvasRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(
    null
  );
  const [backgroundOutline, setBackgroundOutline] =
    useState<HTMLImageElement | null>(null);

  const initialize = () => {
    const canvas = canvasRef.current as unknown as HTMLCanvasElement;
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
      outlineImg.src = "/images/garden-outline.png";
      outlineImg.onload = () => {
        setBackgroundOutline(outlineImg);
      };
    }
  };

  useEffect(() => {
    initialize();
  }, [backgroundImage]);

  const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw background image if it's loaded
    if (backgroundImg && imgLoaded) {
      ctx.drawImage(backgroundImg, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    if (backgroundOutline) {
      ctx.drawImage(
        backgroundOutline,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    }

    // Draw the animated circle
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current as unknown as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Canvas Context not found");
      return;
    }
    let frameCount = 0;
    let animationFrameId = -1;

    const render = () => {
      frameCount++;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw, imgLoaded, backgroundImg]); // Include imgLoaded and backgroundImg in the dependency array

  return <canvas ref={canvasRef} {...props} />;
};

export default Canvas;
