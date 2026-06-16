export enum TileFamily {
  Empty = 0x00,
  Wall = 0x10,
  Stairs = 0x20,
  Gem = 0x30,
  Item = 0x40,
  RotatingDoor = 0x50,
}

export enum ItemTile {
  Knife = 0x41,
  Pickaxe = 0x42,
}

export function tileFamily(tile: number): TileFamily {
  return (tile & 0xf0) as TileFamily;
}

export function isSolid(tile: number): boolean {
  return tileFamily(tile) === TileFamily.Wall;
}

export function isRotatingDoor(tile: number): boolean {
  return tileFamily(tile) === TileFamily.RotatingDoor;
}

export function isBlocking(tile: number): boolean {
  return isSolid(tile);
}

export function isStairs(tile: number): boolean {
  return tileFamily(tile) === TileFamily.Stairs;
}

export function isGem(tile: number): boolean {
  return tileFamily(tile) === TileFamily.Gem;
}

export function isItem(tile: number): boolean {
  return tileFamily(tile) === TileFamily.Item;
}

export function isKnife(tile: number): boolean {
  return tile === ItemTile.Knife;
}

export function isPickaxe(tile: number): boolean {
  return tile === ItemTile.Pickaxe;
}
