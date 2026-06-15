import { GameState, GameStatus } from "./GameState";

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    this.ctx = ctx;
  }

  render(state: GameState) {
    this.ctx.clearRect(0, 0, 256, 192);

    switch (state.status) {
      case GameStatus.KonamiLogo:
        this.drawText("KONAMI", 96, 80);
        break;

      case GameStatus.MainMenu:
        this.drawText("OPEN KINGS VALLEY 2", 48, 72);
        this.drawText("PUSH SPACE KEY", 64, 104);
        break;

      case GameStatus.Playing:
        this.drawStage();
        this.drawPlayer(state);
        break;
    }
  }

  private drawStage() {
    this.ctx.fillStyle = "#101820";
    this.ctx.fillRect(0, 0, 256, 192);

    this.ctx.fillStyle = "#b09050";
    for (let x = 0; x < 256; x += 8) {
      this.ctx.fillRect(x, 144, 8, 8);
    }
  }

  private drawPlayer(state: GameState) {
    const p = state.player;

    this.ctx.fillStyle = state.mode === "original" ? "#ffffff" : "#ffd166";
    this.ctx.fillRect(p.x, p.y, 12, 16);
  }

  private drawText(text: string, x: number, y: number) {
    this.ctx.fillStyle = "white";
    this.ctx.font = "8px monospace";
    this.ctx.fillText(text, x, y);
  }
}
