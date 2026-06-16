import type { Mummy } from "../actors/Mummy";
import type { Player } from "../actors/Player";
import { GameStatus } from "../core/GameStatus";
import type { KnifeProjectile } from "../Game";
import type { RotatingDoor } from "../engine/RotatingDoorSystem";
import {
  isGem,
  isItem,
  isKnife,
  isPickaxe,
  isRotatingDoor,
  isSolid,
  isStairs,
} from "../maps/Tile";
import type { TileMap } from "../maps/TileMap";
import type { Camera } from "./Camera";

export interface RenderState {
  timer: number;
  status: GameStatus;
  player: Player;
  map: TileMap;
  camera: Camera;
  graphicsMode: "original" | "enhanced";
  score: number;
  lives: number;
  knives: KnifeProjectile[];
  mummies: Mummy[];
  doors: RotatingDoor[];
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  render(state: RenderState) {
    this.ctx.clearRect(0, 0, 256, 192);

    switch (state.status) {
      case GameStatus.KonamiLogo:
        this.drawLogo();
        return;

      case GameStatus.MainMenu:
        this.drawMenu();
        return;

      case GameStatus.Playing:
        this.drawPlaying(state);
        return;

      case GameStatus.GameOver:
        this.drawGameOver(state.score);
        return;
    }
  }

  private drawLogo() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, 256, 192);
    this.drawCentered("KONAMI", 80);
  }

  private drawMenu() {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, 256, 192);
    this.drawCentered("OPEN KINGS VALLEY 2", 72);
    this.drawCentered("PRESS SPACE", 104);
  }

  private drawGameOver(score: number) {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, 256, 192);
    this.drawCentered("GAME OVER", 80);
    this.drawCentered(`SCORE ${score}`, 100);
    this.drawCentered("REFRESH TO RESTART", 120);
  }

  private drawPlaying(state: RenderState) {
    const cameraX = state.camera.x;

    this.drawMap(state.map, cameraX);
    this.drawDoors(state.doors, cameraX);
    this.drawKnives(state.knives, cameraX);
    this.drawMummies(state.mummies, cameraX);
    this.drawPlayer(state.player, cameraX, state.graphicsMode);
    this.drawDebug(state.player, cameraX, state.score, state.lives);
  }

  private drawMap(map: TileMap, cameraX: number) {
    this.ctx.fillStyle = "#101820";
    this.ctx.fillRect(0, 0, 256, 192);

    const firstTile = Math.floor(cameraX / 8);
    const lastTile = firstTile + 33;

    for (let y = 0; y < map.height; y++) {
      for (let x = firstTile; x <= lastTile; x++) {
        const tile = map.getTile(x, y);

        if (isRotatingDoor(tile)) {
          continue;
        }

        const screenX = x * map.tileSize - cameraX;
        const screenY = y * map.tileSize;

        if (isSolid(tile)) {
          this.ctx.fillStyle = "#b58b4c";
          this.ctx.fillRect(screenX, screenY, map.tileSize, map.tileSize);

          this.ctx.fillStyle = "#6b4e2e";
          this.ctx.fillRect(screenX, screenY + 7, map.tileSize, 1);
        }

        if (isStairs(tile)) {
          this.ctx.fillStyle = "#c0c0c0";
          this.ctx.fillRect(screenX + 1, screenY, 1, 8);
          this.ctx.fillRect(screenX + 6, screenY, 1, 8);
          this.ctx.fillRect(screenX + 1, screenY + 2, 6, 1);
          this.ctx.fillRect(screenX + 1, screenY + 5, 6, 1);
        }

        if (isGem(tile)) {
          this.ctx.fillStyle = "#00ffff";
          this.ctx.fillRect(screenX + 2, screenY + 1, 4, 6);

          this.ctx.fillStyle = "#ffffff";
          this.ctx.fillRect(screenX + 3, screenY + 2, 1, 1);
        }

        if (isItem(tile)) {
          if (isKnife(tile)) {
            this.ctx.fillStyle = "#dddddd";
            this.ctx.fillRect(screenX + 1, screenY + 3, 6, 1);

            this.ctx.fillStyle = "#8b4513";
            this.ctx.fillRect(screenX + 5, screenY + 4, 2, 2);
          }

          if (isPickaxe(tile)) {
            this.ctx.fillStyle = "#dddddd";
            this.ctx.fillRect(screenX + 1, screenY + 2, 6, 1);

            this.ctx.fillStyle = "#8b4513";
            this.ctx.fillRect(screenX + 4, screenY + 3, 1, 4);
          }
        }
      }
    }
  }

  private drawDoors(doors: RotatingDoor[], cameraX: number) {
    for (const door of doors) {
      const x = door.tx * 8 - cameraX;
      const y = door.ty * 8;

      if (door.state === "open") {
        this.ctx.fillStyle = "#1a4fa3";
        this.ctx.fillRect(x + 3, y, 2, 16);
        continue;
      }

      const width = door.state === "closed" ? 6 : Math.max(2, 6 - door.frame);
      const offset = Math.floor((8 - width) / 2);

      this.ctx.fillStyle = "#2f80ff";
      this.ctx.fillRect(x + offset, y, width, 16);

      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillRect(x + offset + Math.floor(width / 2), y + 1, 1, 14);

      this.ctx.fillStyle = "#111111";
      this.ctx.fillRect(x + offset + 1, y + 6, 1, 1);
    }
  }

  private drawKnives(knives: KnifeProjectile[], cameraX: number) {
    this.ctx.fillStyle = "#ffffff";

    for (const knife of knives) {
      this.ctx.fillRect(Math.floor(knife.x - cameraX), Math.floor(knife.y), 6, 1);
    }
  }

  private drawMummies(mummies: Mummy[], cameraX: number) {
    for (const mummy of mummies) {
      if (!mummy.active) continue;

      const x = Math.floor(mummy.x - cameraX);
      const y = Math.floor(mummy.y);

      this.ctx.fillStyle = "#e0e0e0";
      this.ctx.fillRect(x, y, 12, 16);

      this.ctx.fillStyle = "#999";
      this.ctx.fillRect(x + 1, y + 3, 10, 1);
      this.ctx.fillRect(x + 1, y + 7, 10, 1);
      this.ctx.fillRect(x + 1, y + 11, 10, 1);

      this.ctx.fillStyle = "#222";
      this.ctx.fillRect(x + 3, y + 4, 2, 2);
      this.ctx.fillRect(x + 7, y + 4, 2, 2);
    }
  }

  private drawPlayer(player: Player, cameraX: number, mode: "original" | "enhanced") {
    const screenX = Math.floor(player.x - cameraX);
    const screenY = Math.floor(player.y);

    if (mode === "original") {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillRect(screenX, screenY, 12, 16);
      return;
    }

    this.ctx.fillStyle = "#ffd166";
    this.ctx.fillRect(screenX, screenY, 12, 16);

    this.ctx.fillStyle = "#222";
    this.ctx.fillRect(screenX + 3, screenY + 4, 2, 2);
    this.ctx.fillRect(screenX + 7, screenY + 4, 2, 2);
  }

  private drawDebug(player: Player, cameraX: number, score: number, lives: number) {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "8px monospace";

    this.ctx.fillText(`PX:${Math.floor(player.x)}`, 4, 10);
    this.ctx.fillText(`PY:${Math.floor(player.y)}`, 4, 20);
    this.ctx.fillText(`CAM:${Math.floor(cameraX)}`, 4, 30);
    this.ctx.fillText(`SCORE:${score}`, 4, 40);
    this.ctx.fillText(`LIVES:${lives}`, 4, 50);
    this.ctx.fillText(`KNIFE:${player.hasKnife ? "Y" : "N"}`, 4, 60);
    this.ctx.fillText(`PICK:${player.hasPickaxe ? "Y" : "N"}`, 4, 70);
  }

  private drawCentered(text: string, y: number) {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "8px monospace";

    const width = this.ctx.measureText(text).width;
    this.ctx.fillText(text, (256 - width) / 2, y);
  }
}
