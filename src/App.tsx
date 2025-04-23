import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Canvas from "./components/Canvas";

function App() {
  const [backgroundSrc, setBackgroundSrc] = useState(
    "/images/abs158-floral.png"
  );

  //@ts-ignore
  const handleImageChange = (e) => {
    setBackgroundSrc(e.target.value);
  };

  return <Canvas />;
}

export default App;
