//@ts-nocheck
import React, { useRef, useEffect, useState } from "react";

const Canvas = (props) => {
  const { backgroundImage } = props;
  const canvasRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [backgroundImg, setBackgroundImg] = useState(null);

  const initialize = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = 1152; // Removed px from string - width/height should be numbers
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
    }
  };

  useEffect(() => {
    initialize();
  }, [backgroundImage]);

  const draw = (ctx, frameCount) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw background image if it's loaded
    if (backgroundImg && imgLoaded) {
      ctx.drawImage(backgroundImg, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // Draw the animated circle
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    let frameCount = 0;
    let animationFrameId;

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
