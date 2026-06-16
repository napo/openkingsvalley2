import type { Direction } from "./Actor";

export interface Mummy {
  x: number;
  y: number;
  vx: number;
  direction: Direction;
  active: boolean;
  frame: number;
}

export function createMummy(
  x: number,
  y: number
): Mummy {
  return {
    x,
    y,
    vx: 0.5,
    direction: "right",
    active: true,
    frame: 0,
  };
}
