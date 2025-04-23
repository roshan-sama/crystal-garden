//@ts-nocheck
import React, { useRef, useEffect } from "react";

/** https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258 */
const Canvas = (props) => {
  const canvasRef = useRef(null);

  const initialize = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    console.log(canvas, "cv");
    console.log("setting w,h");
    canvas.width = "1152px";
    canvas.height = "648px";
  };

  useEffect(() => {
    initialize();
  }, []);
  //  https://stackoverflow.com/questions/58579426/in-useeffect-whats-the-difference-between-providing-no-dependency-array-and-an
  //  Giving it an empty array acts like componentDidMount as in, it only runs once.

  const draw = (ctx, frameCount) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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

    //Our draw came here
    const render = () => {
      frameCount++;
      draw(context, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return <canvas ref={canvasRef} {...props} />;
};

export default Canvas;
