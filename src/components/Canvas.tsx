import React, { useRef, useEffect, useState, useCallback } from "react";

const Canvas: React.FC<{ backgroundImage: string }> = (props) => {
  const { backgroundImage } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(
    null
  );
  const [backgroundOutline, setBackgroundOutline] =
    useState<HTMLImageElement | null>(null);
  const [pulsingState, setPulsingState] = useState<{
    currentRadius: number;
    x: number;
    y: number;
    lastFrameTime: number;
  } | null>(null);

  const initialize = () => {
    const canvas = canvasRef.current as unknown as HTMLCanvasElement;
    if (!canvas) {
      console.error("Canvas ref not found in initialize function");
      return;
    }
    canvas.width = 1152;
    canvas.height = 648;
    // diagonal = sqrt (1152 ** 2 + 648 ** 2) = 1322
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

  // Handle user interaction with the canvas
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get the canvas position
    const rect = canvas.getBoundingClientRect();

    // Calculate mouse position relative to canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Start a new pulse
    setPulsingState({
      x,
      y,
      currentRadius: 32, // Starting radius
      lastFrameTime: performance.now(),
    });
  };

  const drawSoundPulse = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      maxRadius: number
    ) => {
      // Calculate progress ratio (0 to 1)
      const progress = radius / maxRadius;

      // Calculate transparency: starts at 100% opacity (0% transparent) and fades to 20% opacity (80% transparent)
      const alpha = 0.6 * (1 - progress * 0.8);

      // Calculate line width: starts at 4px and grows to 18px
      const lineWidth = 2 + progress * 30;

      // Set stroke style
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = lineWidth;

      // Draw the pulse circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    },
    []
  );

  const draw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      frameCount: number,
      currentTime: number
    ) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Draw the animated circle
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw a sound pulse if needed
      if (pulsingState) {
        const { x, y, currentRadius, lastFrameTime } = pulsingState;

        // Calculate time since last frame in seconds
        const deltaTime = (currentTime - lastFrameTime) / 1000;

        // pulseVelocity = 1322 px / 3.5 seconds = 377.7 px/s
        const pulseVelocity = 1322 / 2.5;

        // Calculate new radius based on velocity and time elapsed
        const newRadius = currentRadius + pulseVelocity * deltaTime;

        // Draw the pulse
        drawSoundPulse(ctx, x, y, newRadius, 1322);

        // Check if pulse is complete
        if (newRadius >= 1322) {
          // Pulse has reached max size, reset pulsingState
          setPulsingState(null);
        } else {
          // Update pulsingState with new radius and time
          setPulsingState({
            x,
            y,
            currentRadius: newRadius,
            lastFrameTime: currentTime,
          });
        }
      }
    },
    [backgroundImg, imgLoaded, backgroundOutline, pulsingState, drawSoundPulse]
  );

  useEffect(() => {
    const canvas = canvasRef.current as unknown as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Canvas Context not found");
      return;
    }

    let frameCount = 0;
    let animationFrameId = -1;

    const render = (time: number) => {
      frameCount++;
      draw(context, frameCount, time);
      animationFrameId = window.requestAnimationFrame(render);
    };

    // Pass the timestamp to the render function
    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return (
    <div style={{ position: "relative", width: "1152px", height: "648px" }}>
      {/* Background image layer */}
      {backgroundImg && imgLoaded && (
        <img
          src={backgroundImage}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          alt="Background"
        />
      )}

      {/* Main canvas for animations */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        {...props}
      />

      {/* Outline layer on top */}
      {backgroundOutline && (
        <img
          src="/images/garden-outline.png"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
          alt="Outline"
        />
      )}
    </div>
  );
};

export default Canvas;
