export type RotatingDoorState =
  | "closed"
  | "rotating"
  | "open"
  | "closing";

export interface RotatingDoor {
  tx: number;
  ty: number;
  state: RotatingDoorState;
  timer: number;
  frame: number;
}

export class RotatingDoorSystem {
  private doors: RotatingDoor[];

  constructor() {
    this.doors = [
      {
        tx: 26,
        ty: 16,
        state: "closed",
        timer: 0,
        frame: 0,
      },
    ];
  }

  getDoors(): RotatingDoor[] {
    return this.doors;
  }

  update() {
    for (const door of this.doors) {
      if (door.state === "closed") {
        door.frame = 0;
        continue;
      }

      door.timer--;

      if (door.state === "rotating") {
        door.frame = Math.floor((20 - door.timer) / 5) % 4;

        if (door.timer <= 0) {
          door.state = "open";
          door.timer = 90;
          door.frame = 3;
        }
      }

      else if (door.state === "open") {
        door.frame = 3;

        if (door.timer <= 0) {
          door.state = "closing";
          door.timer = 20;
        }
      }

      else if (door.state === "closing") {
        door.frame = Math.floor(door.timer / 5) % 4;

        if (door.timer <= 0) {
          door.state = "closed";
          door.timer = 0;
          door.frame = 0;
        }
      }
    }
  }

  isBlockingAtPixel(x: number, y: number): boolean {
    const door = this.findDoorAtPixel(x, y);

    if (!door) {
      return false;
    }

    return door.state !== "open";
  }

  pushAtPixel(x: number, y: number): boolean {
    const door = this.findDoorAtPixel(x, y);

    if (!door) {
      return false;
    }

    if (door.state === "closed") {
      door.state = "rotating";
      door.timer = 20;
      door.frame = 0;
      return true;
    }

    return false;
  }

  private findDoorAtPixel(x: number, y: number): RotatingDoor | null {
    const tx = Math.floor(x / 8);
    const ty = Math.floor(y / 8);

    for (const door of this.doors) {
      const sameColumn = tx === door.tx;
      const inHeight = ty === door.ty || ty === door.ty + 1;

      if (sameColumn && inHeight) {
        return door;
      }
    }

    return null;
  }
}
