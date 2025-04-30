import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import { Slider } from "../components/ui/slider";
import { ICrystal } from "@/interfaces/ICrystal";

const crystalOptions = [
  "/images/crystals/base-crystal.png",
  "/images/crystals/butterfly-crystal.png",
  "/images/crystals/cube-crystal.png",
  "/images/crystals/part-crystal.png",
  "/images/crystals/triangle-crystal.png",
];

const colorOptions = [
  { name: "Ruby Red", value: "#E32636" },
  { name: "Amethyst Purple", value: "#9966CC" },
  { name: "Sapphire Blue", value: "#0F52BA" },
  { name: "Emerald Green", value: "#50C878" },
  { name: "Topaz Yellow", value: "#FFBE7D" },
  { name: "Diamond White", value: "#E6E6FA" },
  { name: "Onyx Black", value: "#353935" },
  { name: "Opal Teal", value: "#40E0D0" },
  { name: "Rose Quartz", value: "#F7CAC9" },
  { name: "Amber Orange", value: "#FFBF00" },
  { name: "Jade Green", value: "#00A86B" },
  { name: "Turquoise", value: "#40E0D0" },
  { name: "Aquamarine", value: "#7FFFD4" },
  { name: "Garnet", value: "#733635" },
  { name: "Peridot", value: "#AAFF00" },
  { name: "Tanzanite Blue", value: "#3B429F" },
];

// C major scale frequencies - C3 (bass) through C5 (two octaves above middle C)
const toneOptions = [
  { note: "C3", frequency: 130.81 },
  { note: "D3", frequency: 146.83 },
  { note: "E3", frequency: 164.81 },
  { note: "F3", frequency: 174.61 },
  { note: "G3", frequency: 196.0 },
  { note: "A3", frequency: 220.0 },
  { note: "B3", frequency: 246.94 },
  { note: "C4 (Middle C)", frequency: 261.63 },
  { note: "D4", frequency: 293.66 },
  { note: "E4", frequency: 329.63 },
  { note: "F4", frequency: 349.23 },
  { note: "G4", frequency: 392.0 },
  { note: "A4", frequency: 440.0 },
  { note: "B4", frequency: 493.88 },
  { note: "C5", frequency: 523.25 },
];

const NewCrystalWorkflow = ({
  onAddCrystal,
  canvasCenter,
}: {
  onAddCrystal: (crystal: ICrystal) => void;
  canvasCenter: { x: number; y: number };
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCrystal, setSelectedCrystal] = useState<string>(
    crystalOptions[0]
  );
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const [selectedTone, setSelectedTone] = useState(toneOptions[7]); // Default to middle C
  const [previewCrystal, setPreviewCrystal] = useState<ICrystal | null>(null);

  // Update preview whenever any of these dependencies change
  useEffect(() => {
    if (isOpen) {
      updatePreview();
    }
  }, [isOpen, selectedCrystal, selectedColor, selectedTone]);

  // Create and update preview canvas
  const updatePreview = () => {
    // Create a 128x128 canvas
    const previewCanvas = document.createElement("canvas");
    previewCanvas.width = 128;
    previewCanvas.height = 128;
    const ctx = previewCanvas.getContext("2d");

    if (!ctx) {
      console.error("ctx was null for previewCanvas");
      return;
    }
    // Load the crystal image
    const img = new Image();
    img.src = selectedCrystal;

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

      // Draw the crystal image centered on the canvas
      const xPos = (previewCanvas.width - img.width) / 2;
      const yPos = (previewCanvas.height - img.height) / 2;
      ctx.drawImage(img, 0, 0, 128, 128);

      // Apply color tint/filter
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = selectedColor;
      ctx.globalAlpha = 0.5; // Adjust opacity for tint effect
      ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // Create the crystal object with the canvas
      setPreviewCrystal({
        spritePath: selectedCrystal,
        color: selectedColor,
        tone: selectedTone.frequency,
        scale: 1,
        x: 0, // These will be set when the crystal is placed
        y: 0,
        crystalCanvas: previewCanvas,
        isPlaced: false,
      });
    };
  };

  const handleAddCrystal = () => {
    if (!previewCrystal) return;

    const newCrystal = {
      ...previewCrystal,
      x: canvasCenter.x / 2,
      y: canvasCenter.y / 2,
    } as ICrystal;

    onAddCrystal(newCrystal);
    setIsOpen(false);
  };

  // Handlers for state changes
  const handleCrystalSelect = (crystal: string) => {
    setSelectedCrystal(crystal);
    // No need to manually call updatePreview here
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // No need to manually call updatePreview here
  };

  const handleToneSelect = (index: number) => {
    setSelectedTone(toneOptions[index]);
    // No need to manually call updatePreview here
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-4 right-4 rounded-full p-4 bg-indigo-600 hover:bg-indigo-700">
          Add Crystal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle>Create New Crystal</DialogTitle>
          <DialogDescription>
            Design your crystal by selecting its appearance, color, and tone.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-1">
            <Tabs defaultValue="crystal">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="crystal">Shape</TabsTrigger>
                <TabsTrigger value="color">Color</TabsTrigger>
                <TabsTrigger value="tone">Tone</TabsTrigger>
              </TabsList>

              {/* Crystal Selection Tab */}
              <TabsContent value="crystal" className="space-y-4 ">
                <h3 className="text-lg font-medium">Select Crystal Shape</h3>
                <Carousel className="text-black w-4/5 mx-auto">
                  <CarouselContent>
                    {crystalOptions.map((crystal, index) => (
                      <CarouselItem key={index}>
                        <div
                          className={`bg-gray-800 p-4 m-1 rounded-lg h-40 flex items-center justify-center cursor-pointer ${
                            selectedCrystal === crystal
                              ? "ring-2 ring-white"
                              : ""
                          }`}
                          onClick={() => handleCrystalSelect(crystal)}
                        >
                          <img
                            src={crystal}
                            alt={`Crystal option ${index + 1}`}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </TabsContent>

              {/* Color Selection Tab */}
              <TabsContent value="color" className="space-y-4">
                <h3 className="text-lg font-medium">Select Crystal Color</h3>
                <div className="grid grid-cols-4 gap-3">
                  {colorOptions.map((color, index) => (
                    <div
                      key={index}
                      className={`h-16 rounded-lg cursor-pointer ${
                        selectedColor === color.value ? "ring-2 ring-white" : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorSelect(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* Tone Selection Tab */}
              <TabsContent value="tone" className="space-y-4">
                <h3 className="text-lg font-medium">Select Crystal Tone</h3>
                <div className="pt-8 pb-4">
                  <div className="flex justify-between mb-2">
                    <span>Bass C (C3)</span>
                    <span>Middle C</span>
                    <span>High C (C5)</span>
                  </div>
                  <Slider
                    min={0}
                    max={toneOptions.length - 1}
                    step={1}
                    value={[
                      toneOptions.findIndex(
                        (t) => t.frequency === selectedTone.frequency
                      ),
                    ]}
                    onValueChange={(value) => handleToneSelect(value[0])}
                  />
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <h4>Selected Note:</h4>
                      <p className="text-xl font-bold">{selectedTone.note}</p>
                    </div>
                    <div>
                      <h4>Frequency:</h4>
                      <p className="text-xl font-bold">
                        {selectedTone.frequency} Hz
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={() => {
                        // Play the tone
                        const audioContext = new AudioContext();
                        const oscillator = audioContext.createOscillator();
                        oscillator.type = "sine";
                        oscillator.frequency.value = selectedTone.frequency;
                        oscillator.connect(audioContext.destination);
                        oscillator.start();
                        setTimeout(() => oscillator.stop(), 1000);
                      }}
                      className="w-full"
                    >
                      Play Tone
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Section */}
          <div className="col-span-1 bg-gray-800 rounded-lg p-4 flex flex-col">
            <h3 className="text-lg font-medium mb-4">Crystal Preview</h3>
            <div className="flex-1 flex items-center justify-center bg-black rounded-lg">
              {previewCrystal && previewCrystal.crystalCanvas && (
                <div
                  style={{ filter: `drop-shadow(0 0 10px ${selectedColor})` }}
                >
                  <div
                    style={{
                      width: "200px",
                      height: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={previewCrystal.crystalCanvas.toDataURL()}
                      alt="Crystal preview"
                      className="max-h-[200px] max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button
                onClick={handleAddCrystal}
                disabled={!previewCrystal}
                className="w-full"
              >
                Place Crystal in Garden
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewCrystalWorkflow;
