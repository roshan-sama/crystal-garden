import { ICrystal } from "@/interfaces/ICrystal";
import React, { useRef, useEffect, useState, useCallback } from "react";
// Import a sound library for crystal tones
import * as Tone from "tone";

const Canvas: React.FC<{ backgroundImage: string; crystals: ICrystal[] }> = (
  props
) => {
  const { backgroundImage, crystals } = props;
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
  // Track which crystals have already emitted their tone during current pulse
  const [activatedCrystals, setActivatedCrystals] = useState<Set<number>>(
    new Set()
  );

  // Initialize synthesizer for crystal tones
  const synth = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    // Initialize the synthesizer
    synth.current = new Tone.Synth({
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1.5,
      },
    }).toDestination();

    // Start Tone.js audio context on user interaction (required by browsers)
    const startAudio = () => {
      if (Tone.context.state !== "running") {
        Tone.start();
      }
      document.removeEventListener("click", startAudio);
    };
    document.addEventListener("click", startAudio);

    return () => {
      document.removeEventListener("click", startAudio);
      synth.current?.dispose();
    };
  }, []);

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

  // Reset activated crystals when starting a new pulse
  useEffect(() => {
    if (pulsingState) {
      setActivatedCrystals(new Set());
    }
  }, [pulsingState]);

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

  // Calculate distance between two points
  const getDistance = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  // Draw a crystal on the canvas
  const drawCrystal = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      crystal: ICrystal,
      isActivated: boolean
    ) => {
      const { x, y, scale, color } = crystal;
      const radius = 16 * scale; // Base size is 16, scaled by crystal's scale property

      // Draw crystal circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);

      console.log("Drawing crystall", x, y);

      // Fill with color based on activation state
      if (isActivated) {
        // Activated crystal: use its color with high brightness
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
      } else {
        // Inactive crystal: darker version of its color
        ctx.fillStyle = "#33ff33";
        ctx.shadowBlur = 0;
      }

      ctx.fill();

      // Reset shadow for other drawings
      ctx.shadowBlur = 0;
    },
    []
  );

  // Play a crystal's tone
  const playCrystalTone = useCallback((frequency: number) => {
    if (!synth.current) return;

    // Convert frequency to note duration based on its value
    // Higher frequencies get shorter durations
    const duration = Math.max(0.5, 1.5 - frequency / 1000);
    console.log("layg ton");
    synth.current.triggerAttackRelease(frequency, duration);
  }, []);

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

      // Draw all crystals (inactive by default)
      if (crystals && crystals.length > 0) {
        crystals.forEach((crystal, index) => {
          const isActivated = activatedCrystals.has(index);
          drawCrystal(ctx, crystal, isActivated);
        });
      }

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

        // Process crystal behavior when pulse reaches them
        if (crystals && crystals.length > 0) {
          crystals.forEach((crystal, index) => {
            // Check if this crystal has already been activated
            if (!activatedCrystals.has(index)) {
              // Calculate distance from pulse center to this crystal
              const distance = getDistance(x, y, crystal.x, crystal.y);

              // If the pulse radius has just exceeded the distance to the crystal
              if (currentRadius < distance && newRadius >= distance) {
                // Play the crystal's tone
                playCrystalTone(crystal.tone);

                // Add this crystal to the activated set
                setActivatedCrystals((prev) => {
                  const newSet = new Set(prev);
                  newSet.add(index);
                  return newSet;
                });
              }
            } else {
            }
          });
        }

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
    [
      backgroundImg,
      imgLoaded,
      backgroundOutline,
      pulsingState,
      drawSoundPulse,
      crystals,
      activatedCrystals,
      drawCrystal,
      playCrystalTone,
    ]
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
      {/* {backgroundImg && imgLoaded && (
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
      )} */}

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
