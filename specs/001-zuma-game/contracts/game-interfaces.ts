/**
 * Game Interface Contracts: Classic Zuma Game
 *
 * These interfaces define the public API between game modules.
 * Implementation must adhere to these contracts.
 */

// =============================================================================
// Enums
// =============================================================================

export enum BallColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple'
}

export enum BallState {
  NORMAL = 'normal',
  INSERTED = 'inserted',
  EXPLODING = 'exploding'
}

export enum GameStatus {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  WIN = 'win',
  LOSE = 'lose'
}

// =============================================================================
// Value Objects
// =============================================================================

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Vector {
  readonly x: number;
  readonly y: number;
}

// =============================================================================
// Core Game Interfaces
// =============================================================================

export interface IBall {
  readonly id: string;
  color: BallColor;
  distanceAlongPath: number;
  state: BallState;
  prev: IBall | null;
  next: IBall | null;
}

export interface IChain {
  head: IBall | null;
  tail: IBall | null;
  velocity: number;
  splitPoint: number | null;
  backVelocity: number;

  /** Insert a ball at the given position */
  insertBall(ball: IBall, afterBall: IBall | null): void;

  /** Remove a ball from the chain */
  removeBall(ball: IBall): void;

  /** Get all balls as an array (for iteration) */
  getBalls(): IBall[];

  /** Check if chain is empty */
  isEmpty(): boolean;

  /** Get ball count */
  getLength(): number;
}

export interface IPath {
  readonly id: string;
  readonly totalLength: number;
  readonly holePosition: Point;
  readonly spawnPosition: Point;

  /** Get position on path at given distance from hole */
  getPointAtDistance(distance: number): Point;

  /** Get direction vector at given distance */
  getTangentAtDistance(distance: number): Vector;

  /** Find closest point on path to a given point, returns distance */
  getClosestDistance(point: Point): number;
}

export interface IShooter {
  readonly position: Point;
  rotation: number;
  currentBall: BallColor;
  reserveBall: BallColor;
  cooldown: number;

  /** Swap current and reserve balls */
  swap(): void;

  /** Check if shooter can fire */
  canFire(): boolean;

  /** Fire a ball, returns the fired ball or null if on cooldown */
  fire(): IBall | null;

  /** Set aim direction based on target point */
  aimAt(target: Point): void;
}

export interface ILevel {
  readonly id: number;
  readonly name: string;
  readonly path: IPath;
  readonly colors: readonly BallColor[];
  readonly ballSpeed: number;
  readonly spawnRate: number;
  readonly spawnThreshold: number;
  readonly initialBallCount: number;
}

export interface IScore {
  current: number;
  total: number;
  chainMultiplier: number;
  highScore: number;

  /** Add points for a match */
  addMatchPoints(ballCount: number, isChainReaction: boolean): number;

  /** Reset for new level */
  resetLevel(): void;

  /** Reset for new game */
  resetGame(): void;

  /** Persist high score */
  saveHighScore(): void;

  /** Load high score from storage */
  loadHighScore(): void;
}

// =============================================================================
// Game State Interface
// =============================================================================

export interface IGameState {
  status: GameStatus;
  currentLevel: number;
  level: ILevel | null;
  chain: IChain;
  shooter: IShooter;
  score: IScore;
  ballsSpawned: number;
  firedBalls: IBall[];
  timeElapsed: number;
}

// =============================================================================
// Game Logic Interfaces
// =============================================================================

export interface ICollisionDetector {
  /**
   * Check if fired ball collides with chain
   * Returns the ball it collides with and whether to insert before or after
   */
  checkBallChainCollision(
    firedBall: IBall,
    firedBallPosition: Point,
    chain: IChain,
    path: IPath
  ): { collidedWith: IBall; insertBefore: boolean } | null;

  /**
   * Check if any chain ball has reached the hole
   */
  checkHoleCollision(chain: IChain, path: IPath): boolean;
}

export interface IMatchDetector {
  /**
   * Find matching balls starting from a given ball
   * Returns array of balls to remove (3+ same color)
   */
  findMatch(startBall: IBall): IBall[];

  /**
   * Check if removing balls will create a chain reaction opportunity
   */
  willCreateChainReaction(
    ballsToRemove: IBall[],
    chain: IChain
  ): { frontColor: BallColor; backColor: BallColor } | null;
}

export interface IBallSpawner {
  /**
   * Get next ball color using weighted random
   */
  getNextColor(chain: IChain, availableColors: readonly BallColor[]): BallColor;

  /**
   * Spawn a new ball at path start
   */
  spawnBall(chain: IChain, path: IPath, color: BallColor): IBall;
}

// =============================================================================
// Rendering Interfaces
// =============================================================================

export interface IRenderer {
  /** Clear and prepare for new frame */
  clear(): void;

  /** Render the complete game state */
  render(state: IGameState): void;

  /** Get canvas dimensions */
  getSize(): { width: number; height: number };
}

export interface IBallRenderer {
  /** Render a single ball */
  renderBall(ball: IBall, position: Point, ctx: CanvasRenderingContext2D): void;

  /** Render explosion effect */
  renderExplosion(position: Point, color: BallColor, progress: number, ctx: CanvasRenderingContext2D): void;
}

export interface IPathRenderer {
  /** Render the path (debug/guide line) */
  renderPath(path: IPath, ctx: CanvasRenderingContext2D): void;

  /** Render the hole */
  renderHole(position: Point, ctx: CanvasRenderingContext2D): void;
}

export interface IUIRenderer {
  /** Render score display */
  renderScore(score: IScore, ctx: CanvasRenderingContext2D): void;

  /** Render menu screen */
  renderMenu(ctx: CanvasRenderingContext2D): void;

  /** Render pause overlay */
  renderPause(ctx: CanvasRenderingContext2D): void;

  /** Render win screen */
  renderWin(score: IScore, level: number, ctx: CanvasRenderingContext2D): void;

  /** Render lose screen */
  renderLose(score: IScore, ctx: CanvasRenderingContext2D): void;
}

// =============================================================================
// Input Interfaces
// =============================================================================

export interface IInputHandler {
  /** Get current mouse position */
  getMousePosition(): Point;

  /** Check if fire button is pressed this frame */
  isFirePressed(): boolean;

  /** Check if swap button is pressed this frame */
  isSwapPressed(): boolean;

  /** Check if pause button is pressed this frame */
  isPausePressed(): boolean;

  /** Update input state (call once per frame) */
  update(): void;
}

// =============================================================================
// Audio Interface
// =============================================================================

export interface IAudioManager {
  /** Play a sound effect */
  play(sound: SoundEffect): void;

  /** Set master volume (0-1) */
  setVolume(volume: number): void;

  /** Mute/unmute all sounds */
  setMuted(muted: boolean): void;

  /** Preload all sound effects */
  preload(): Promise<void>;
}

export enum SoundEffect {
  SHOOT = 'shoot',
  MATCH = 'match',
  CHAIN = 'chain',
  INSERT = 'insert',
  WIN = 'win',
  LOSE = 'lose',
  SWAP = 'swap'
}

// =============================================================================
// Game Controller Interface
// =============================================================================

export interface IGameController {
  /** Initialize game, load assets */
  init(): Promise<void>;

  /** Start a new game from level 1 */
  startNewGame(): void;

  /** Start a specific level */
  startLevel(levelId: number): void;

  /** Pause the game */
  pause(): void;

  /** Resume from pause */
  resume(): void;

  /** Quit to menu */
  quitToMenu(): void;

  /** Retry current level */
  retry(): void;

  /** Advance to next level */
  nextLevel(): void;

  /** Main game loop tick */
  update(deltaTime: number): void;

  /** Get current game state (readonly) */
  getState(): Readonly<IGameState>;
}
