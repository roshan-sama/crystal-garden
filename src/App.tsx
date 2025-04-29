import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Canvas from "./components/Canvas";
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
      // img.onload = () => crystalPathToImageMap.set(path, img);
    });
    setTimeout(() => {
      // console.log(crystalPathToImageMap, "asd");
    }, 5000);
  }, []);

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
        <Canvas
          backgroundImage={backgroundSrc}
          crystals={crystals}
          // crystalPathToImageMap={crystalPathToImageMap}
        />
      </div>
    </div>
  );
}

export default App;

/**I have this app component that needs a new component, perhaps called NewCrystalWorkflow,
 * that's lets users create and place a new crystal. Assume that the Canvas component handles the display
 * of the crystals
 * Create just that component, or a series of components that do the following
 * 1) A UI modal, that on the left side has three tabs, one for crystal selection, where we have a shadcn carousel that displays
 * each of the crystal images
 * 2) the second tab allows for color selection of the crystal, create a list of 16 colors you think would be good
 * 3) the third tab allows for tone selection. Get creative with how to do this, we need to provide tones from the C major scale, from bass clef c to 2 octaves higher than middle C
 * */
