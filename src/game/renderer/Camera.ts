export class Camera {
  x = 0;
  y = 0;
  room = 0;

  readonly roomWidth = 256;
  readonly maxRoom = 2;

  setRoom(room: number) {
    this.room = Math.max(0, Math.min(this.maxRoom, room));
    this.x = this.room * this.roomWidth;
  }

  nextRoom() {
    this.setRoom(this.room + 1);
  }

  previousRoom() {
    this.setRoom(this.room - 1);
  }
}
