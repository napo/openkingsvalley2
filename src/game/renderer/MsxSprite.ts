export interface MsxSprite16 {
  left: number[];
  right: number[];
}

export interface MsxGfxBlock {
  sprites16?: MsxSprite16[];
  tiles?: number[][];
}

export type MsxGfxJson = Record<string, MsxGfxBlock>;

export class MsxSpriteStore {
  private data: MsxGfxJson | null = null;
  private loading = false;

  async load() {
    if (this.data || this.loading) return;

    this.loading = true;

    const url = `${import.meta.env.BASE_URL}assets/msx/gfx.json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Cannot load MSX gfx: ${url}`);
    }

    this.data = await response.json();
  }

  getSprites(label: string): MsxSprite16[] {
    return this.data?.[label]?.sprites16 ?? [];
  }

  isReady(): boolean {
    return this.data !== null;
  }
}

export function drawMsxSprite16(
  ctx: CanvasRenderingContext2D,
  sprite: MsxSprite16,
  x: number,
  y: number,
  color = "#ffffff",
  flipX = false
) {
  ctx.fillStyle = color;

  for (let row = 0; row < 16; row++) {
    const bytes = [
      sprite.left[row] ?? 0,
      sprite.right[row] ?? 0,
    ];

    for (let part = 0; part < 2; part++) {
      const value = bytes[part];

      for (let bit = 7; bit >= 0; bit--) {
        const pixelOn = (value >> bit) & 1;

        if (!pixelOn) continue;

        const px = part * 8 + (7 - bit);
        const finalX = flipX ? 15 - px : px;

        ctx.fillRect(
          Math.floor(x + finalX),
          Math.floor(y + row),
          1,
          1
        );
      }
    }
  }
}
