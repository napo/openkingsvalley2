import { isSolid, ItemTile } from "./Tile";

export class TileMap {
  readonly width = 96;
  readonly height = 24;
  readonly tileSize = 8;

  private tiles: number[];

  constructor() {
    this.tiles = new Array(
      this.width * this.height
    ).fill(0x00);

    this.buildTestMap();
  }

  getTile(tx: number, ty: number): number {
    if (
      tx < 0 ||
      tx >= this.width ||
      ty < 0 ||
      ty >= this.height
    ) {
      return 0x10;
    }

    return this.tiles[
      ty * this.width + tx
    ];
  }

  setTile(
    tx: number,
    ty: number,
    value: number
  ) {
    if (
      tx < 0 ||
      tx >= this.width ||
      ty < 0 ||
      ty >= this.height
    ) {
      return;
    }

    this.tiles[
      ty * this.width + tx
    ] = value;
  }

  getTileAtPixel(
    x: number,
    y: number
  ): number {
    const tx = Math.floor(
      x / this.tileSize
    );

    const ty = Math.floor(
      y / this.tileSize
    );

    return this.getTile(tx, ty);
  }

  isSolidAtPixel(
    x: number,
    y: number
  ): boolean {
    return isSolid(
      this.getTileAtPixel(x, y)
    );
  }

  collectGemAtPixel(
    x: number,
    y: number
  ): boolean {
    const tx = Math.floor(
      x / this.tileSize
    );

    const ty = Math.floor(
      y / this.tileSize
    );

    const tile = this.getTile(tx, ty);

    if ((tile & 0xf0) !== 0x30) {
      return false;
    }

    this.setTile(tx, ty, 0x00);

    return true;
  }

  collectItemAtPixel(
    x: number,
    y: number
  ): number | null {
    const tx = Math.floor(
      x / this.tileSize
    );

    const ty = Math.floor(
      y / this.tileSize
    );

    const tile = this.getTile(tx, ty);

    if ((tile & 0xf0) !== 0x40) {
      return null;
    }

    this.setTile(tx, ty, 0x00);

    return tile;
  }

  removeSolidAtPixel(
    x: number,
    y: number
  ): boolean {
    const tx = Math.floor(
      x / this.tileSize
    );

    const ty = Math.floor(
      y / this.tileSize
    );

    const tile = this.getTile(tx, ty);

    if ((tile & 0xf0) !== 0x10) {
      return false;
    }

    this.setTile(tx, ty, 0x00);

    return true;
  }

  private buildTestMap() {

    // pavimento principale

    for (let x = 0; x < this.width; x++) {
      for (
        let y = 18;
        y < this.height;
        y++
      ) {
        this.setTile(x, y, 0x10);
      }
    }

    // piattaforma 1

    for (let x = 10; x < 20; x++) {
      this.setTile(x, 13, 0x10);
    }

    // piattaforma 2

    for (let x = 35; x < 50; x++) {
      this.setTile(x, 10, 0x10);
    }

    // piattaforma 3

    for (let x = 65; x < 80; x++) {
      this.setTile(x, 7, 0x10);
    }

    // colonne

    for (let y = 12; y < 18; y++) {
      this.setTile(28, y, 0x10);
    }

    for (let y = 9; y < 18; y++) {
      this.setTile(58, y, 0x10);
    }

    // scale

    for (let y = 13; y < 18; y++) {
      this.setTile(16, y, 0x20);
    }

    for (let y = 10; y < 18; y++) {
      this.setTile(43, y, 0x20);
    }

    for (let y = 7; y < 18; y++) {
      this.setTile(72, y, 0x20);
    }

    // gemme

    this.setTile(14, 12, 0x30);
    this.setTile(40, 9, 0x30);
    this.setTile(70, 6, 0x30);

    // oggetti vicini allo start

    this.setTile(
      6,
      17,
      ItemTile.Knife
    );

    this.setTile(
      8,
      17,
      ItemTile.Pickaxe
    );

    this.setTile(
      12,
      17,
      ItemTile.Pickaxe
    );

    // oggetti lontani

    this.setTile(
      22,
      17,
      ItemTile.Knife
    );

    this.setTile(
      52,
      17,
      ItemTile.Pickaxe
    );
  }
}
