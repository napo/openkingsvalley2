export enum GameStatus {
  KonamiLogo = 0,
  MainMenu = 1,
  Demo = 2,
  StartGame = 3,
  EnterStage = 4,
  Playing = 5,
  Dead = 6,
  GameOver = 7,
  StageClear = 8,
  Scroll = 9,
  Ending = 10,
}

export type GameMode = "original" | "enhanced";

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: "left" | "right";
  status: "walk" | "jump" | "fall" | "stairs" | "throw" | "dig" | "door";
  frame: number;
}

export interface GameState {
  timer: number;
  status: GameStatus;
  subStatus: number;
  mode: GameMode;
  player: Player;
}
