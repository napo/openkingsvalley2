export interface DigEffect {
  tx: number;
  ty: number;
  timer: number;
  duration: number;
  done: boolean;
}

export function createDigEffect(tx: number, ty: number): DigEffect {
  return {
    tx,
    ty,
    timer: 24,
    duration: 24,
    done: false,
  };
}
