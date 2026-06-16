import type { Player } from "../actors/Player";
import { PlayerStatus } from "../actors/Player";
import type { Input } from "./Input";
import type { TileMap } from "../maps/TileMap";
import { isStairs } from "../maps/Tile";

export type PlayerAction = "throwKnife" | "dig" | null;

export class PlayerSystem {
  update(player: Player, input: Input, map: TileMap): PlayerAction {
    switch (player.status) {
      case PlayerStatus.Walking:
        return this.walk(player, input, map);

      case PlayerStatus.Jumping:
      case PlayerStatus.Falling:
        this.jumpOrFall(player, input, map);
        break;

      case PlayerStatus.Stairs:
        this.stairs(player, input, map);
        break;

      case PlayerStatus.ThrowingKnife:
      case PlayerStatus.Digging:
      case PlayerStatus.RotatingDoor:
        this.action(player);
        break;
    }

    player.frame = Math.floor(player.moveCounter / 4) % 8;
    return null;
  }

  private walk(player: Player, input: Input, map: TileMap): PlayerAction {
    let dx = 0;

    if (input.isDown("ArrowLeft")) {
      dx = -1;
      player.direction = "left";
    }

    if (input.isDown("ArrowRight")) {
      dx = 1;
      player.direction = "right";
    }

    if (
      (input.isDown("ArrowUp") || input.isDown("ArrowDown")) &&
      this.isOnStairs(player, map)
    ) {
      player.status = PlayerStatus.Stairs;
      player.x = Math.floor((player.x + 6) / 8) * 8 + 2;
      player.vy = 0;
      return null;
    }
    

    if (input.consumePressed("Space")) {
      player.status = PlayerStatus.Jumping;
      player.vy = -4;
      return null;
    }

    if (input.consumePressed("KeyZ") && player.hasKnife) {
      player.hasKnife = false;
      player.status = PlayerStatus.ThrowingKnife;
      player.actionCounter = 12;
      return "throwKnife";
    }

    if (input.consumePressed("KeyX") && player.hasPickaxe) {
      player.hasPickaxe = false;
      player.status = PlayerStatus.Digging;
      player.actionCounter = 21;
      return "dig";
   }

    if (!this.hasFloor(player, map)) {
      player.status = PlayerStatus.Falling;
      player.vy = 0;
      return null;
    }

    if (dx !== 0) {
      this.tryMoveX(player, dx, map);
      player.moveCounter++;
    }

    return null;
  }

  private jumpOrFall(player: Player, input: Input, map: TileMap) {
    let dx = 0;

    if (input.isDown("ArrowLeft")) {
      dx = -1;
      player.direction = "left";
    }

    if (input.isDown("ArrowRight")) {
      dx = 1;
      player.direction = "right";
    }

    if (dx !== 0) {
      this.tryMoveX(player, dx, map);
    }

    player.y += player.vy;
    player.vy += 0.25;

    if (player.vy > 0) {
      player.status = PlayerStatus.Falling;
    }

    if (player.vy >= 0 && this.hasFloor(player, map)) {
      player.y = Math.floor((player.y + 16) / 8) * 8 - 16;
      player.vy = 0;
      player.status = PlayerStatus.Walking;
    }

    player.moveCounter++;
  }


   private stairs(player: Player, input: Input, map: TileMap) {
     let dy = 0;

     if (input.isDown("ArrowUp")) dy = -1;
     if (input.isDown("ArrowDown")) dy = 1;

     if (input.consumePressed("Space")) {
       player.status = PlayerStatus.Jumping;
       player.vy = -3.5;
       return;
    }

     if (input.isDown("ArrowLeft")) {
       player.direction = "left";
       player.status = PlayerStatus.Walking;
       return;
    }

     if (input.isDown("ArrowRight")) {
       player.direction = "right";
       player.status = PlayerStatus.Walking;
       return;
    }

     if (dy === 0) return;

     player.y += dy;
     player.moveCounter++;

    const stillOnStairs =
       this.isOnStairs(player, map) ||
       isStairs(map.getTileAtPixel(player.x + 6, player.y + 4)) ||
      isStairs(map.getTileAtPixel(player.x + 6, player.y + 16));

     if (!stillOnStairs) {
       player.y = Math.round(player.y / 8) * 8;

       if (this.hasFloor(player, map)) {
         player.status = PlayerStatus.Walking;
         player.vy = 0;
       } else {
         player.status = PlayerStatus.Falling;
         player.vy = 0;
      }
     }
   }

  private action(player: Player) {
    player.actionCounter--;

    if (player.actionCounter <= 0) {
      player.status = PlayerStatus.Walking;
      player.actionCounter = 0;
    }
  }

  private tryMoveX(player: Player, dx: number, map: TileMap) {
    const nextX = player.x + dx;
    const sideX = dx < 0 ? nextX : nextX + 11;

    const blocked =
      map.isSolidAtPixel(sideX, player.y + 2) ||
      map.isSolidAtPixel(sideX, player.y + 15);

    if (!blocked) {
      player.x = nextX;
    }
  }

  private hasFloor(player: Player, map: TileMap): boolean {
    const y = player.y + 17;

    return (
      map.isSolidAtPixel(player.x + 4, y) ||
      map.isSolidAtPixel(player.x + 10, y)
    );
  }

   private isOnStairs(player: Player, map: TileMap): boolean {
     return (
      isStairs(map.getTileAtPixel(player.x + 2, player.y + 8)) ||
      isStairs(map.getTileAtPixel(player.x + 6, player.y + 8)) ||
      isStairs(map.getTileAtPixel(player.x + 10, player.y + 8)) ||
      isStairs(map.getTileAtPixel(player.x + 2, player.y + 14)) ||
      isStairs(map.getTileAtPixel(player.x + 6, player.y + 14)) ||
      isStairs(map.getTileAtPixel(player.x + 10, player.y + 14))
    );
  }
}
