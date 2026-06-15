import { useEffect, useRef } from "react";
import { Game } from "./game/Game";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new Game(canvasRef.current);
    game.start();

    return () => game.stop();
  }, []);

  return (
    <main>
      <canvas
        ref={canvasRef}
        width={256}
        height={192}
        style={{
          width: "768px",
          height: "576px",
          imageRendering: "pixelated",
          background: "black",
        }}
      />
    </main>
  );
}
