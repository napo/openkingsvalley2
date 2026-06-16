export class Camera {
  x = 0;
  y = 0;

  update(playerX: number) {
    this.x = Math.max(0, playerX - 128);

    const maxCameraX = 96 * 8 - 256;
    this.x = Math.min(this.x, maxCameraX);
  }
}
