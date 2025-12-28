import { GameStatus } from '../core/types.ts';
import { Chain } from '../core/Chain.ts';
import { Ball } from '../core/Ball.ts';

/**
 * Central game state container.
 * Holds all game data and provides a single source of truth.
 */
export interface LevelConfig {
  id: number;
  name: string;
  ballSpeed: number;
  spawnRate: number;
  spawnThreshold: number;
  initialBallCount: number;
}

export interface ShooterState {
  x: number;
  y: number;
  rotation: number;
  currentBallColor: string;
  reserveBallColor: string;
  cooldown: number;
}

export interface ScoreState {
  current: number;
  total: number;
  chainMultiplier: number;
  highScore: number;
}

export class GameState {
  // Core game status
  status: GameStatus = GameStatus.MENU;
  currentLevel: number = 1;

  // Level configuration (set when level loads)
  levelConfig: LevelConfig | null = null;

  // Game objects
  chain: Chain = new Chain();
  firedBalls: Ball[] = [];

  // Shooter state
  shooter: ShooterState = {
    x: 400,
    y: 300,
    rotation: 0,
    currentBallColor: 'red',
    reserveBallColor: 'blue',
    cooldown: 0
  };

  // Score state
  score: ScoreState = {
    current: 0,
    total: 0,
    chainMultiplier: 1,
    highScore: 0
  };

  // Level progress
  ballsSpawned: number = 0;
  timeElapsed: number = 0;
  spawnAccumulator: number = 0;

  // Animation state
  explosions: Array<{
    x: number;
    y: number;
    color: string;
    progress: number;
  }> = [];

  /**
   * Reset state for a new game
   */
  resetForNewGame(): void {
    this.status = GameStatus.MENU;
    this.currentLevel = 1;
    this.score.current = 0;
    this.score.total = 0;
    this.score.chainMultiplier = 1;
    this.chain.clear();
    this.firedBalls = [];
    this.explosions = [];
    this.ballsSpawned = 0;
    this.timeElapsed = 0;
    this.spawnAccumulator = 0;
  }

  /**
   * Reset state for starting a level
   */
  resetForLevel(levelConfig: LevelConfig): void {
    this.levelConfig = levelConfig;
    this.chain.clear();
    this.chain.velocity = levelConfig.ballSpeed;
    this.firedBalls = [];
    this.explosions = [];
    this.ballsSpawned = 0;
    this.timeElapsed = 0;
    this.spawnAccumulator = 0;
    this.score.current = 0;
    this.score.chainMultiplier = 1;
    this.shooter.cooldown = 0;
  }

  /**
   * Check if spawning is complete
   */
  isSpawningComplete(): boolean {
    if (!this.levelConfig) return false;
    return this.ballsSpawned >= this.levelConfig.spawnThreshold;
  }

  /**
   * Check if player has won (all balls cleared after spawning complete)
   */
  hasWon(): boolean {
    return this.isSpawningComplete() && this.chain.isEmpty() && this.firedBalls.length === 0;
  }

  /**
   * Add an explosion effect
   */
  addExplosion(x: number, y: number, color: string): void {
    this.explosions.push({ x, y, color, progress: 0 });
  }

  /**
   * Update explosions (call each frame)
   */
  updateExplosions(deltaTime: number): void {
    const speed = 3; // Explosion speed
    this.explosions = this.explosions.filter(exp => {
      exp.progress += deltaTime * speed;
      return exp.progress < 1;
    });
  }

  /**
   * Save high score to localStorage
   */
  saveHighScore(): void {
    if (this.score.total > this.score.highScore) {
      this.score.highScore = this.score.total;
      try {
        localStorage.setItem('zuma_high_score', this.score.highScore.toString());
      } catch (e) {
        console.warn('Could not save high score to localStorage');
      }
    }
  }

  /**
   * Load high score from localStorage
   */
  loadHighScore(): void {
    try {
      const saved = localStorage.getItem('zuma_high_score');
      if (saved) {
        this.score.highScore = parseInt(saved, 10) || 0;
      }
    } catch (e) {
      console.warn('Could not load high score from localStorage');
    }
  }
}
