import type { Actor } from "./Actor";

export enum PlayerStatus {
  Walking = 0,
  Jumping = 1,
  Falling = 2,
  Stairs = 3,
  ThrowingKnife = 4,
  Digging = 5,
  RotatingDoor = 6,
}

export interface Player extends Actor {
  vx: number;
  vy: number;
  hasKnife: boolean;
  hasPickaxe: boolean;
  moveCounter: number;
  actionCounter: number;
}

export function createPlayer(): Player {
  return {
    x: 32,
    y: 128,
    room: 0,
    frame: 0,
    status: PlayerStatus.Walking,
    direction: "right",
    vx: 0,
    vy: 0,
    hasKnife: false,
    hasPickaxe: false,
    moveCounter: 0,
    actionCounter: 0,
  };
}
