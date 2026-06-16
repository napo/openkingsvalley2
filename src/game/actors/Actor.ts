export type Direction = "left" | "right";

export interface Actor {
  x: number;
  y: number;
  room: number;
  frame: number;
  status: number;
  direction: Direction;
}
