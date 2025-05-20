// src/components/canvas/PlacementControls.tsx
import React from "react";

interface PlacementControlsProps {
  onDone: () => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  onIncreaseScale: () => void;
  onDecreaseScale: () => void;
}

const PlacementControls: React.FC<PlacementControlsProps> = ({
  onDone,
  onRotateClockwise,
  onRotateCounterClockwise,
  onIncreaseScale,
  onDecreaseScale,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "10px",
        borderRadius: "8px",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <span style={{ color: "white", fontSize: "12px", textAlign: "center" }}>
          Rotation
        </span>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            onClick={onRotateCounterClockwise}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#555",
              border: "none",
              borderRadius: "5px",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ↺
          </button>
          <button
            onClick={onRotateClockwise}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#555",
              border: "none",
              borderRadius: "5px",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ↻
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <span style={{ color: "white", fontSize: "12px", textAlign: "center" }}>
          Scale
        </span>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            onClick={onDecreaseScale}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#555",
              border: "none",
              borderRadius: "5px",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            −
          </button>
          <button
            onClick={onIncreaseScale}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#555",
              border: "none",
              borderRadius: "5px",
              color: "white",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={onDone}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer",
          alignSelf: "center",
          marginLeft: "10px",
        }}
      >
        Done
      </button>
    </div>
  );
};

export default PlacementControls;
