import { isBlocking, ItemTile } from "./Tile";

export class TileMap {
  readonly width = 96;
  readonly height = 24;
  readonly tileSize = 8;

  private tiles: number[];

  constructor() {
    this.tiles = new Array(this.width * this.height).fill(0x00);
    this.buildTestMap();
  }

  getTile(tx: number, ty: number): number {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) {
      return 0x10;
    }

    return this.tiles[ty * this.width + tx];
  }

  setTile(tx: number, ty: number, value: number) {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return;
    this.tiles[ty * this.width + tx] = value;
  }

  getTileAtPixel(x: number, y: number): number {
    return this.getTile(
      Math.floor(x / this.tileSize),
      Math.floor(y / this.tileSize)
    );
  }

  isSolidAtPixel(x: number, y: number): boolean {
    return isBlocking(this.getTileAtPixel(x, y));
  }

  isRotatingDoorAtPixel(x: number, y: number): boolean {
    return (this.getTileAtPixel(x, y) & 0xf0) === 0x50;
  }

  collectGemAtPixel(x: number, y: number): boolean {
    const tx = Math.floor(x / this.tileSize);
    const ty = Math.floor(y / this.tileSize);
    const tile = this.getTile(tx, ty);

    if ((tile & 0xf0) !== 0x30) return false;

    this.setTile(tx, ty, 0x00);
    return true;
  }

  collectItemAtPixel(x: number, y: number): number | null {
    const tx = Math.floor(x / this.tileSize);
    const ty = Math.floor(y / this.tileSize);
    const tile = this.getTile(tx, ty);

    if ((tile & 0xf0) !== 0x40) return null;

    this.setTile(tx, ty, 0x00);
    return tile;
  }

  removeSolidAtPixel(x: number, y: number): boolean {
    const tx = Math.floor(x / this.tileSize);
    const ty = Math.floor(y / this.tileSize);
    const tile = this.getTile(tx, ty);

    if ((tile & 0xf0) !== 0x10) return false;

    this.setTile(tx, ty, 0x00);
    return true;
  }

  private buildTestMap() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 18; y < this.height; y++) {
        this.setTile(x, y, 0x10);
      }
    }

    for (let x = 10; x < 20; x++) this.setTile(x, 13, 0x10);
    for (let x = 35; x < 50; x++) this.setTile(x, 10, 0x10);
    for (let x = 65; x < 80; x++) this.setTile(x, 7, 0x10);

    for (let y = 12; y < 18; y++) this.setTile(28, y, 0x10);
    for (let y = 9; y < 18; y++) this.setTile(58, y, 0x10);

    for (let y = 13; y < 18; y++) this.setTile(16, y, 0x20);
    for (let y = 10; y < 18; y++) this.setTile(43, y, 0x20);
    for (let y = 7; y < 18; y++) this.setTile(72, y, 0x20);

    this.setTile(14, 12, 0x30);
    this.setTile(40, 9, 0x30);
    this.setTile(70, 6, 0x30);

    this.setTile(6, 17, ItemTile.Knife);
    this.setTile(8, 17, ItemTile.Pickaxe);
    this.setTile(12, 17, ItemTile.Pickaxe);

    this.setTile(22, 17, ItemTile.Knife);
    this.setTile(52, 17, ItemTile.Pickaxe);

    this.setTile(26, 16, 0x51);
    this.setTile(26, 17, 0x52);
  }
}
