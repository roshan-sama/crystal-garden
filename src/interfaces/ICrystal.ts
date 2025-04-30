export interface ICrystal {
  /** x coordinate of position on canvas */
  x: number;
  /** y coordinate of position on canvas */
  y: number;
  /** Scale, ranges 1 to 32 */
  scale: number;
  /** Hex Color of crystal */
  color: string;
  /** Simple tone in Hz */
  tone: number;
  /** Canvas of the customized crystal */
  crystalCanvas: HTMLCanvasElement;
  /** Path to the path of the base image of crystal*/
  spritePath: string;
}
