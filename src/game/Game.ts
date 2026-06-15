import { GameStatus, GameState } from "./GameState";
import { Input } from "./Input";
import { Renderer } from "./Renderer";

export class Game {
  private running = false;
  private raf = 0;
  private lastTime = 0;
  private accumulator = 0;

  private readonly fps = 60;
  private readonly frameTime = 1000 / this.fps;

  private input: Input;
  private renderer: Renderer;

  private state: GameState = {
    timer: 0,
    status: GameStatus.KonamiLogo,
    subStatus: 0,
    mode: "original",
    player: {
      x: 32,
      y: 128,
      vx: 0,
      vy: 0,
      direction: "right",
      status: "walk",
      frame: 0,
    },
  };

  constructor(canvas: HTMLCanvasElement) {
    this.input = new Input();
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

    const delta = time - this.lastTime;
    this.lastTime = time;
    this.accumulator += delta;

    while (this.accumulator >= this.frameTime) {
      this.tick();
      this.accumulator -= this.frameTime;
    }

    this.renderer.render(this.state);
    this.raf = requestAnimationFrame(this.loop);
  };

  private tick() {
    this.state.timer++;

    switch (this.state.status) {
      case GameStatus.KonamiLogo:
        this.tickLogo();
        break;

      case GameStatus.MainMenu:
        this.tickMenu();
        break;

      case GameStatus.Playing:
        this.tickPlaying();
        break;
    }
  }

  private tickLogo() {
    if (this.state.timer > 120) {
      this.state.status = GameStatus.MainMenu;
      this.state.timer = 0;
    }
  }

  private tickMenu() {
    if (this.input.isPressed("Space") || this.input.isPressed("Enter")) {
      this.state.status = GameStatus.Playing;
      this.state.timer = 0;
    }
  }

  private tickPlaying() {
    const p = this.state.player;
    const speed = 1;

    if (this.input.isDown("ArrowLeft")) {
      p.x -= speed;
      p.direction = "left";
    }

    if (this.input.isDown("ArrowRight")) {
      p.x += speed;
      p.direction = "right";
    }

    if (this.input.isPressed("Space")) {
      p.status = "jump";
      p.vy = -4;
    }

    if (p.status === "jump" || p.status === "fall") {
      p.y += p.vy;
      p.vy += 0.25;

      if (p.vy > 0) p.status = "fall";

      if (p.y >= 128) {
        p.y = 128;
        p.vy = 0;
        p.status = "walk";
      }
    }

    p.frame = Math.floor(this.state.timer / 8) % 4;
  }
}
