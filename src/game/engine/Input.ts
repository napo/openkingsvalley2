export class Input {
  private down = new Set<string>();
  private pressed = new Set<string>();

  private keyDown = (event: KeyboardEvent) => {
    if (!this.down.has(event.code)) {
      this.pressed.add(event.code);
    }

    this.down.add(event.code);
  };

  private keyUp = (event: KeyboardEvent) => {
    this.down.delete(event.code);
  };

  attach() {
    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
  }

  detach() {
    window.removeEventListener("keydown", this.keyDown);
    window.removeEventListener("keyup", this.keyUp);
  }

  isDown(code: string): boolean {
    return this.down.has(code);
  }

  consumePressed(code: string): boolean {
    const value = this.pressed.has(code);
    this.pressed.delete(code);
    return value;
  }
}
