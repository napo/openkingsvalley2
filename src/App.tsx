import { useEffect, useRef } from "react";
import { Game } from "./game/Game";
import "./App.css";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new Game(canvasRef.current);
    game.start();

    return () => game.stop();
  }, []);

  return (
    <main className="app">
      <h1>OpenKingsValley2</h1>
      <canvas ref={canvasRef} width={256} height={192} className="game-canvas" />
      <p>Frecce: muovi · Spazio: salta · M: Original/Enhanced</p>
    </main>
  );
}
