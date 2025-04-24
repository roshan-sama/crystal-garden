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
  /** Path to the image of this crystal */
  spritePath: string;
}
