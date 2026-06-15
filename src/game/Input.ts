export class Input {
  private down = new Set<string>();
  private pressed = new Set<string>();

  private onKeyDown = (event: KeyboardEvent) => {
    if (!this.down.has(event.code)) {
      this.pressed.add(event.code);
    }

    this.down.add(event.code);
  };

  private onKeyUp = (event: KeyboardEvent) => {
    this.down.delete(event.code);
  };

  attach() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  detach() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  isDown(code: string) {
    return this.down.has(code);
  }

  isPressed(code: string) {
    const value = this.pressed.has(code);
    this.pressed.delete(code);
    return value;
  }
}
