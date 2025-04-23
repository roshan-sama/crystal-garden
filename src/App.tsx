import { useState } from "react";
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

function App() {
  const [backgroundSrc, setBackgroundSrc] = useState(
    "/images/abs158-floral.png"
  );

  //@ts-ignore
  const handleImageChange = (e) => {
    console.log(e, "e tg");
    setBackgroundSrc(e.target.value);
  };

  return (
    <div
      className="flex flex-col w-screen h-screen"
      style={{ backgroundColor: "black" }}
    >
      <div className="text-white m-auto rounded-md p-4">
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
      <div className="m-auto">
        <Canvas backgroundImage={backgroundSrc} />
      </div>
    </div>
  );
}

export default App;
