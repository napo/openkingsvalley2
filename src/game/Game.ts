import { createMummy, type Mummy } from "./actors/Mummy";
import { createPlayer } from "./actors/Player";
import { GameStatus } from "./core/GameStatus";
import { Input } from "./engine/Input";
import { PlayerSystem } from "./engine/PlayerSystem";
import { ItemTile } from "./maps/Tile";
import { TileMap } from "./maps/TileMap";
import { Camera } from "./renderer/Camera";
import { Renderer } from "./renderer/Renderer";

export interface KnifeProjectile {
  x: number;
  y: number;
  vx: number;
  active: boolean;
}

export class Game {
  private running = false;
  private raf = 0;

  private readonly fps = 60;
  private readonly frameMs = 1000 / this.fps;

  private lastTime = 0;
  private accumulator = 0;

  private timer = 0;
  private score = 0;
  private lives = 3;
  private status = GameStatus.KonamiLogo;
  private graphicsMode: "original" | "enhanced" = "original";

  private readonly input = new Input();
  private readonly map = new TileMap();
  private readonly player = createPlayer();
  private readonly camera = new Camera();
  private readonly playerSystem = new PlayerSystem();
  private readonly renderer: Renderer;

  private knives: KnifeProjectile[] = [];

  private mummies: Mummy[] = [
    createMummy(180, 128),
    createMummy(380, 128),
    createMummy(590, 40),
  ];

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
  }

  start() {
    this.running = true;
    this.input.attach();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    this.input.detach();
    cancelAnimationFrame(this.raf);
  }

  private loop = (time: number) => {
    if (!this.running) return;

    if (this.lastTime === 0) this.lastTime = time;

    const delta = time - this.lastTime;
    this.lastTime = time;
    this.accumulator += delta;

    while (this.accumulator >= this.frameMs) {
      this.tick();
      this.accumulator -= this.frameMs;
    }

    this.renderer.render({
      timer: this.timer,
      status: this.status,
      player: this.player,
      map: this.map,
      camera: this.camera,
      graphicsMode: this.graphicsMode,
      score: this.score,
      lives: this.lives,
      knives: this.knives,
      mummies: this.mummies,
    });

    this.raf = requestAnimationFrame(this.loop);
  };

  private tick() {
    this.timer++;

    if (this.input.consumePressed("KeyM")) {
      this.graphicsMode =
        this.graphicsMode === "original" ? "enhanced" : "original";
    }

    switch (this.status) {
      case GameStatus.KonamiLogo:
        if (this.timer > 120) {
          this.status = GameStatus.MainMenu;
          this.timer = 0;
        }
        break;

      case GameStatus.MainMenu:
        if (
          this.input.consumePressed("Space") ||
          this.input.consumePressed("Enter")
        ) {
          this.status = GameStatus.Playing;
          this.timer = 0;
        }
        break;

      case GameStatus.Playing:
        this.tickPlaying();
        break;
    }
  }

  private tickPlaying() {
    const action = this.playerSystem.update(
      this.player,
      this.input,
      this.map
    );

    if (action === "throwKnife") {
      this.spawnKnife();
    }

    if (action === "dig") {
      this.digBlock();
    }

    if (this.map.collectGemAtPixel(this.player.x + 6, this.player.y + 8)) {
      this.score += 100;
    }

    const item = this.map.collectItemAtPixel(
      this.player.x + 6,
      this.player.y + 8
    );

    if (item === ItemTile.Knife) {
      this.player.hasKnife = true;
    }

    if (item === ItemTile.Pickaxe) {
      this.player.hasPickaxe = true;
    }

    this.updateKnives();
    this.updateMummies();
    this.checkKnifeHits();
    this.checkPlayerHits();

    this.camera.update(this.player.x);
  }

  private spawnKnife() {
    const direction = this.player.direction === "left" ? -1 : 1;

    this.knives.push({
      x: this.player.x + (direction > 0 ? 12 : -4),
      y: this.player.y + 7,
      vx: direction * 3,
      active: true,
    });
  }

  private updateKnives() {
    for (const knife of this.knives) {
      if (!knife.active) continue;

      knife.x += knife.vx;

      if (this.map.isSolidAtPixel(knife.x, knife.y)) {
        knife.active = false;
      }

      if (knife.x < 0 || knife.x > this.map.width * this.map.tileSize) {
        knife.active = false;
      }
    }

    this.knives = this.knives.filter((knife) => knife.active);
  }

  private updateMummies() {
    for (const mummy of this.mummies) {
      if (!mummy.active) continue;

      const nextX = mummy.x + mummy.vx;
      const sideX = mummy.vx > 0 ? nextX + 12 : nextX;
      const footY = mummy.y + 17;

      const hitsWall =
        this.map.isSolidAtPixel(sideX, mummy.y + 4) ||
        this.map.isSolidAtPixel(sideX, mummy.y + 14);

      const hasFloor =
        this.map.isSolidAtPixel(sideX, footY);

      if (hitsWall || !hasFloor) {
        mummy.vx *= -1;
        mummy.direction = mummy.vx < 0 ? "left" : "right";
      } else {
        mummy.x = nextX;
      }

      mummy.frame = Math.floor(this.timer / 12) % 2;
    }
  }

  private checkKnifeHits() {
    for (const knife of this.knives) {
      if (!knife.active) continue;

      for (const mummy of this.mummies) {
        if (!mummy.active) continue;

        if (this.overlaps(knife.x, knife.y, 6, 2, mummy.x, mummy.y, 12, 16)) {
          knife.active = false;
          mummy.active = false;
          this.score += 500;
        }
      }
    }

    this.knives = this.knives.filter((knife) => knife.active);
  }

  private checkPlayerHits() {
    for (const mummy of this.mummies) {
      if (!mummy.active) continue;

      if (
        this.overlaps(
          this.player.x,
          this.player.y,
          12,
          16,
          mummy.x,
          mummy.y,
          12,
          16
        )
      ) {
        this.loseLife();
        return;
      }
    }
  }

  private loseLife() {
    this.lives--;

    this.player.x = 32;
    this.player.y = 128;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.hasKnife = false;
    this.player.hasPickaxe = false;

    this.knives = [];

    if (this.lives <= 0) {
      this.status = GameStatus.GameOver;
      this.timer = 0;
    }
  }

  private digBlock() {
    const direction = this.player.direction === "left" ? -1 : 1;

    const targetX =
      direction > 0
        ? this.player.x + 14
        : this.player.x - 2;

    const targetY = this.player.y + 16;

    if (this.map.removeSolidAtPixel(targetX, targetY)) {
      this.score += 50;
    }
  }

  private overlaps(
    ax: number,
    ay: number,
    aw: number,
    ah: number,
    bx: number,
    by: number,
    bw: number,
    bh: number
  ): boolean {
    return (
      ax < bx + bw &&
      ax + aw > bx &&
      ay < by + bh &&
      ay + ah > by
    );
  }
}
