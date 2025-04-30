import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Canvas from "./components/Canvas";
import NewCrystalWorkflow from "./components/NewCrystalWorkflow";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { ICrystal } from "./interfaces/ICrystal";

function App() {
  const [backgroundSrc, setBackgroundSrc] = useState(
    "/images/abs158-floral.png"
  );
  const crystalPathToImageMap = new Map<string, HTMLImageElement>();
  const canvasHeight = 648; // pixels
  const canvasWidth = 1152; // pixels
  const [crystals, setCrystals] = useState<ICrystal[]>([]);

  useEffect(() => {
    const crystalPaths = [
      "/images/crystals/base-crystal.png",
      "/images/crystals/butterfly-crystal.png",
      "/images/crystals/cube-crystal.png",
      "/images/crystals/part-crystal.png",
      "/images/crystals/triangle-crystal.png",
    ];
    crystalPaths.forEach((path) => {
      const img = new Image();
      img.src = path;
      img.onload = () => crystalPathToImageMap.set(path, img);
    });
    setTimeout(() => {
      console.log(crystalPathToImageMap, "asd");
    }, 5000);
  }, []);

  // Handler function to add a new crystal to the collection
  const handleAddCrystal = (newCrystal: ICrystal) => {
    console.debug("Adding crystal");
    setCrystals((prevCrystals) => [...prevCrystals, newCrystal]);
  };

  return (
    <div
      className="flex flex-col w-screen h-screen pt-2"
      style={{ backgroundColor: "black" }}
    >
      <div className="text-white w-[1152px] mx-auto rounded-md px-4">
        <span>Your Garden is</span>
        <Select value={backgroundSrc} onValueChange={setBackgroundSrc}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Choose your Garden" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Gardens</SelectLabel>
              <SelectItem value="/images/abs158-floral.png">Floral</SelectItem>
              <SelectItem value="/images/abs160-feline.png">Feline</SelectItem>
              <SelectItem value="/images/abs171-finish.png">Finish</SelectItem>
              <SelectItem value="/images/abs179-pint.png">Pint</SelectItem>
              <SelectItem value="/images/abs208-velcro.png">Velcro</SelectItem>
              <SelectItem value="/images/abs218-clear.png">Clear</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="mx-auto">
        <Canvas backgroundImage={backgroundSrc} crystals={crystals} />
      </div>

      {/* Add the NewCrystalWorkflow component */}
      <NewCrystalWorkflow
        onAddCrystal={handleAddCrystal}
        canvasCenter={{ x: canvasWidth, y: canvasHeight }}
      />
    </div>
  );
}

export default App;
