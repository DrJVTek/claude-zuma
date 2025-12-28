import { Renderer } from './rendering/Renderer.ts';
import { AudioManager } from './audio/AudioManager.ts';
import { PathRenderer } from './rendering/PathRenderer.ts';
import { BallRenderer } from './rendering/BallRenderer.ts';
import { ShooterRenderer } from './rendering/ShooterRenderer.ts';
import { EffectsRenderer } from './rendering/Effects.ts';
import { MouseInput } from './input/MouseInput.ts';
import { KeyboardInput } from './input/KeyboardInput.ts';
import { GameState } from './state/GameState.ts';
import { StateManager } from './state/StateManager.ts';
import { Chain } from './core/Chain.ts';
import { Ball } from './core/Ball.ts';
import { Shooter } from './core/Shooter.ts';
import { BallSpawner } from './core/BallSpawner.ts';
import { Path } from './core/Path.ts';
import {
  checkBallChainCollision,
  checkHoleCollision,
  findMatch,
  checkChainReaction
} from './core/Collision.ts';
import { getLevel, TOTAL_LEVELS } from './levels/index.ts';
import { LevelConfig } from './core/Level.ts';
import { Score } from './core/Score.ts';
import { GameStatus, BallColor, CANVAS_WIDTH, CANVAS_HEIGHT, BALL_RADIUS } from './core/types.ts';

/**
 * Main game controller and entry point.
 */
class Game {
  private renderer: Renderer;
  private pathRenderer: PathRenderer;
  private ballRenderer: BallRenderer;
  private shooterRenderer: ShooterRenderer;
  private effectsRenderer: EffectsRenderer;
  private mouseInput: MouseInput;
  private keyboardInput: KeyboardInput;
  private state: GameState;
  private stateManager: StateManager;

  // Game objects
  private chain: Chain;
  private shooter: Shooter;
  private spawner: BallSpawner;
  private currentPath: Path | null = null;
  private currentLevel: LevelConfig | null = null;
  private firedBalls: Ball[] = [];

  // Chain reaction tracking
  private pendingChainReaction: { frontBall: Ball | null; backBall: Ball | null } | null = null;

  // Score tracking
  private score: Score;

  // Audio
  private audio: AudioManager;

  constructor() {
    // Initialize rendering
    this.renderer = new Renderer('game-canvas');
    this.pathRenderer = new PathRenderer(this.renderer.ctx);
    this.ballRenderer = new BallRenderer(this.renderer.ctx);
    this.shooterRenderer = new ShooterRenderer(this.renderer.ctx);
    this.effectsRenderer = new EffectsRenderer(this.renderer.ctx);

    // Initialize input
    this.mouseInput = new MouseInput(this.renderer.canvas);
    this.keyboardInput = new KeyboardInput();

    // Initialize state
    this.state = new GameState();
    this.stateManager = new StateManager(this.state);

    // Initialize game objects
    this.chain = new Chain();
    this.shooter = new Shooter(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.spawner = new BallSpawner([BallColor.RED, BallColor.BLUE, BallColor.GREEN, BallColor.YELLOW]);

    // Initialize score
    this.score = new Score();

    // Initialize audio
    this.audio = new AudioManager();

    // Set up game loop callbacks
    this.renderer.onUpdate(this.update.bind(this));
    this.renderer.onRender(this.render.bind(this));

    // Set up state change handler
    this.stateManager.setOnStateChange(this.onStateChange.bind(this));
  }

  /**
   * Start the game
   */
  start(): void {
    console.log('Zuma Game starting...');
    this.renderer.start();
  }

  /**
   * Handle state transitions
   */
  private onStateChange(newStatus: GameStatus): void {
    if (newStatus === GameStatus.PLAYING) {
      // Check if this is a new game (from menu) or continuation
      if (this.state.currentLevel === 1) {
        this.handleNewGame();
      }
      this.initializeLevel();
    } else if (newStatus === GameStatus.WIN) {
      this.handleLevelComplete();
      this.audio.play('win');
    } else if (newStatus === GameStatus.LOSE) {
      this.audio.play('lose');
    }
  }

  /**
   * Initialize the current level
   */
  private initializeLevel(): void {
    // Get level config based on current level number
    const levelConfig = getLevel(this.state.currentLevel);
    if (!levelConfig) {
      console.error(`Level ${this.state.currentLevel} not found!`);
      return;
    }

    this.currentLevel = levelConfig;
    this.currentPath = this.currentLevel.path;

    // Reset game objects
    this.chain = new Chain();
    this.chain.velocity = this.currentLevel.ballSpeed;
    this.firedBalls = [];
    this.effectsRenderer.clear();

    // Set up spawner
    this.spawner.setColors(this.currentLevel.colors);
    this.spawner.setSpawnRate(this.currentLevel.spawnRate);
    this.spawner.reset();

    // Set up shooter
    this.shooter = new Shooter(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.shooter.setAvailableColors(this.currentLevel.colors);

    // Spawn initial balls
    this.spawner.spawnInitialBalls(this.chain, this.currentPath, this.currentLevel.initialBallCount);

    // Reset score for level
    this.score.resetLevel();

    // Reset state
    this.state.resetForLevel({
      id: this.currentLevel.id,
      name: this.currentLevel.name,
      ballSpeed: this.currentLevel.ballSpeed,
      spawnRate: this.currentLevel.spawnRate,
      spawnThreshold: this.currentLevel.spawnThreshold,
      initialBallCount: this.currentLevel.initialBallCount
    });
    this.state.ballsSpawned = this.currentLevel.initialBallCount;
  }

  /**
   * Main update loop
   */
  private update(deltaTime: number): void {
    // Handle input for all states
    this.handleInput();

    // Only update game logic when playing
    if (this.stateManager.isPlaying()) {
      this.updateGame(deltaTime);
    }

    // Update effects (visual only)
    this.effectsRenderer.update(deltaTime);
  }

  /**
   * Handle player input
   */
  private handleInput(): void {
    const mousePos = this.mouseInput.getMousePosition();

    if (this.stateManager.isInMenu()) {
      if (this.mouseInput.isFirePressed()) {
        if (this.isClickInStartButton(mousePos.x, mousePos.y)) {
          this.stateManager.startGame();
        }
      }
    } else if (this.stateManager.isPlaying()) {
      // Handle pause (Escape key)
      if (this.keyboardInput.isPausePressed()) {
        this.stateManager.pause();
      } else {
        // Update shooter aim
        this.shooter.aimAt(mousePos);

        // Handle fire
        if (this.mouseInput.isFirePressed()) {
          this.fireShooter();
        }

        // Handle swap (right-click or spacebar)
        if (this.mouseInput.isSwapPressed() || this.keyboardInput.isSwapPressed()) {
          this.shooter.swap();
          this.audio.play('swap');
        }
      }
    } else if (this.stateManager.isPaused()) {
      // Handle resume (Escape key or click)
      if (this.keyboardInput.isPausePressed()) {
        this.stateManager.resume();
      } else if (this.mouseInput.isFirePressed()) {
        if (this.isClickInResumeButton(mousePos.x, mousePos.y)) {
          this.stateManager.resume();
        } else if (this.isClickInQuitButton(mousePos.x, mousePos.y)) {
          this.stateManager.quitToMenu();
        }
      }
    } else if (this.stateManager.hasWon()) {
      if (this.mouseInput.isFirePressed()) {
        if (this.stateManager.isFinalLevel()) {
          this.stateManager.quitToMenu();
        } else {
          this.stateManager.nextLevel();
        }
      }
    } else if (this.stateManager.hasLost()) {
      if (this.mouseInput.isFirePressed()) {
        this.stateManager.retry();
      }
    }

    this.mouseInput.update();
    this.keyboardInput.update();
  }

  /**
   * Fire a ball from the shooter
   */
  private fireShooter(): void {
    const colorCounts = this.spawner.countChainColors(this.chain);
    const ball = this.shooter.fire(colorCounts);

    if (ball) {
      this.firedBalls.push(ball);
      this.audio.play('shoot');
    }
  }

  /**
   * Check if click is in start button area
   */
  private isClickInStartButton(x: number, y: number): boolean {
    const buttonX = CANVAS_WIDTH / 2 - 100;
    const buttonY = CANVAS_HEIGHT / 2;
    const buttonWidth = 200;
    const buttonHeight = 50;

    return (
      x >= buttonX &&
      x <= buttonX + buttonWidth &&
      y >= buttonY &&
      y <= buttonY + buttonHeight
    );
  }

  /**
   * Check if click is in resume button area (pause screen)
   */
  private isClickInResumeButton(x: number, y: number): boolean {
    const buttonX = CANVAS_WIDTH / 2 - 100;
    const buttonY = CANVAS_HEIGHT / 2 + 30;
    const buttonWidth = 200;
    const buttonHeight = 40;

    return (
      x >= buttonX &&
      x <= buttonX + buttonWidth &&
      y >= buttonY &&
      y <= buttonY + buttonHeight
    );
  }

  /**
   * Check if click is in quit button area (pause screen)
   */
  private isClickInQuitButton(x: number, y: number): boolean {
    const buttonX = CANVAS_WIDTH / 2 - 100;
    const buttonY = CANVAS_HEIGHT / 2 + 80;
    const buttonWidth = 200;
    const buttonHeight = 40;

    return (
      x >= buttonX &&
      x <= buttonX + buttonWidth &&
      y >= buttonY &&
      y <= buttonY + buttonHeight
    );
  }

  /**
   * Update game logic
   */
  private updateGame(deltaTime: number): void {
    if (!this.currentPath) return;

    // Update shooter cooldown
    this.shooter.update(deltaTime);

    // Update fired balls and check collisions
    this.updateFiredBalls(deltaTime);

    // Update chain movement (only if not closing gap)
    if (!this.chain.isGapClosing()) {
      this.chain.update(deltaTime);
    } else {
      // Update gap closing
      this.updateGapClosing(deltaTime);
    }

    // Spawn new balls
    this.updateSpawning(deltaTime);

    // Update time
    this.state.timeElapsed += deltaTime;

    // Check lose condition
    if (checkHoleCollision(this.chain)) {
      this.stateManager.lose();
      return;
    }

    // Check win condition
    if (this.state.isSpawningComplete() && this.chain.isEmpty() && this.firedBalls.length === 0) {
      this.stateManager.win();
    }
  }

  /**
   * Update fired balls and check for collisions
   */
  private updateFiredBalls(deltaTime: number): void {
    if (!this.currentPath) return;

    const ballsToRemove: Ball[] = [];

    for (const ball of this.firedBalls) {
      // Update position
      ball.updatePosition(deltaTime);

      // Check if off-screen
      if (ball.isOffScreen(CANVAS_WIDTH, CANVAS_HEIGHT)) {
        ballsToRemove.push(ball);
        continue;
      }

      // Check collision with chain
      const collision = checkBallChainCollision(ball, this.chain, this.currentPath);

      if (collision) {
        // Insert ball into chain
        ball.distanceAlongPath = collision.insertionDistance;
        ball.markInserted();

        if (collision.insertBefore) {
          // Insert before the collided ball
          const insertAfter = collision.collidedWith.prev;
          this.chain.insertBall(ball, insertAfter);
        } else {
          // Insert after the collided ball
          this.chain.insertBall(ball, collision.collidedWith);
        }

        ballsToRemove.push(ball);

        // Check for match
        this.checkAndProcessMatch(ball);
      }
    }

    // Remove processed balls
    this.firedBalls = this.firedBalls.filter(b => !ballsToRemove.includes(b));
  }

  /**
   * Check for and process ball matches
   */
  private checkAndProcessMatch(insertedBall: Ball): void {
    if (!this.currentPath) return;

    const match = findMatch(insertedBall);

    if (match) {
      // Create explosions
      for (const ball of match.balls) {
        const pos = this.currentPath.getPointAtDistance(ball.distanceAlongPath);
        this.effectsRenderer.createExplosion(pos.x, pos.y, ball.color);
        ball.startExploding();
      }

      // Remove matched balls and get gap info
      const gapInfo = this.chain.removeBalls(match.balls);

      // Add score
      this.addMatchScore(match.balls.length, false);

      // Store potential chain reaction info
      if (gapInfo.frontBall && gapInfo.backBall) {
        this.pendingChainReaction = gapInfo;
      }
    } else {
      // Reset chain multiplier if no match
      this.score.resetChainMultiplier();
    }
  }

  /**
   * Update gap closing and check for chain reactions
   */
  private updateGapClosing(deltaTime: number): void {
    this.chain.update(deltaTime);

    // Check if gap just closed
    if (!this.chain.isGapClosing() && this.pendingChainReaction) {
      const { frontBall, backBall } = this.pendingChainReaction;
      this.pendingChainReaction = null;

      // Check for chain reaction
      const chainMatch = checkChainReaction(frontBall, backBall);

      if (chainMatch && this.currentPath) {
        // Chain reaction!
        for (const ball of chainMatch.balls) {
          const pos = this.currentPath.getPointAtDistance(ball.distanceAlongPath);
          this.effectsRenderer.createExplosion(pos.x, pos.y, ball.color);
          ball.startExploding();
        }

        // Remove and track next gap
        const newGapInfo = this.chain.removeBalls(chainMatch.balls);

        // Add score with multiplier
        this.addMatchScore(chainMatch.balls.length, true);

        // Set up next potential chain reaction
        if (newGapInfo.frontBall && newGapInfo.backBall) {
          this.pendingChainReaction = newGapInfo;
        }
      } else {
        // No chain reaction, reset multiplier
        this.score.resetChainMultiplier();
      }
    }
  }

  /**
   * Add points for a match
   */
  private addMatchScore(ballCount: number, isChainReaction: boolean): void {
    if (isChainReaction) {
      this.score.incrementChainMultiplier();
      this.audio.play('chain');
    } else {
      this.audio.play('match');
    }
    this.score.addMatchPoints(ballCount);
  }

  /**
   * Update ball spawning
   */
  private updateSpawning(deltaTime: number): void {
    if (!this.currentPath || !this.currentLevel) return;
    if (this.state.isSpawningComplete()) return;

    const remaining = this.currentLevel.spawnThreshold - this.state.ballsSpawned;
    const spawned = this.spawner.update(deltaTime, this.chain, this.currentPath, remaining + this.chain.getLength());

    this.state.ballsSpawned += spawned;
  }

  /**
   * Main render loop
   */
  private render(): void {
    const ctx = this.renderer.ctx;

    if (this.stateManager.isInMenu()) {
      this.renderMenu(ctx);
    } else if (this.stateManager.isPlaying() || this.stateManager.isPaused()) {
      this.renderGame(ctx);

      if (this.stateManager.isPaused()) {
        this.renderPauseOverlay(ctx);
      }
    } else if (this.stateManager.hasWon()) {
      this.renderGame(ctx);
      this.renderWinScreen(ctx);
    } else if (this.stateManager.hasLost()) {
      this.renderGame(ctx);
      this.renderLoseScreen(ctx);
    }
  }

  /**
   * Render menu screen
   */
  private renderMenu(ctx: CanvasRenderingContext2D): void {
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ZUMA', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

    // High score
    ctx.font = '24px Arial';
    ctx.fillText(`High Score: ${this.score.getHighScore()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 + 50);

    // Start button
    ctx.fillStyle = '#4a90d9';
    ctx.fillRect(CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2, 200, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Start Game', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 33);
  }

  /**
   * Render the game
   */
  private renderGame(ctx: CanvasRenderingContext2D): void {
    if (!this.currentPath) return;

    // Draw path (debug mode)
    this.pathRenderer.renderPath(this.currentPath, true);

    // Draw hole
    this.pathRenderer.renderHole(this.currentPath);

    // Draw balls in chain
    this.ballRenderer.renderChain(this.chain.getBalls(), this.currentPath);

    // Draw fired balls
    this.ballRenderer.renderFiredBalls(this.firedBalls);

    // Draw effects
    this.effectsRenderer.render();

    // Draw shooter
    this.shooterRenderer.renderShooter(
      this.shooter.position.x,
      this.shooter.position.y,
      this.shooter.rotation,
      this.shooter.currentBall,
      this.shooter.reserveBall
    );

    // Draw UI
    this.renderUI(ctx);
  }

  /**
   * Render game UI
   */
  private renderUI(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score.getCurrent()}`, 20, 30);
    ctx.fillText(`Level: ${this.state.currentLevel}`, 20, 55);

    // Show chain multiplier if active
    if (this.score.getChainMultiplier() > 1) {
      ctx.fillStyle = '#f1c40f';
      ctx.fillText(`x${this.score.getChainMultiplier()} CHAIN!`, 20, 80);
    }

    // Show spawning progress
    if (this.currentLevel) {
      const progress = this.state.ballsSpawned / this.currentLevel.spawnThreshold;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(CANVAS_WIDTH - 120, 20, 100, 10);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(CANVAS_WIDTH - 120, 20, 100 * progress, 10);

      if (this.state.isSpawningComplete()) {
        ctx.fillStyle = '#2ecc71';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('CLEAR THE CHAIN!', CANVAS_WIDTH - 20, 50);
      }
    }
  }

  /**
   * Render pause overlay
   */
  private renderPauseOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    // Resume button
    ctx.fillStyle = '#4a90d9';
    ctx.fillRect(CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2 + 30, 200, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 57);

    // Quit button
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2 + 80, 200, 40);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Quit to Menu', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 107);

    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('Press ESC to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 150);
  }

  /**
   * Render win screen
   */
  private renderWinScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const isFinal = this.stateManager.isFinalLevel();

    ctx.fillStyle = isFinal ? '#f1c40f' : '#2ecc71';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      isFinal ? 'GAME COMPLETE!' : 'LEVEL COMPLETE!',
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 3
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Level Score: ${this.score.getCurrent()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 15);
    ctx.fillText(`Total Score: ${this.score.getTotal() + this.score.getCurrent()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);

    if (isFinal) {
      ctx.fillStyle = '#f1c40f';
      ctx.fillText(`High Score: ${this.score.getHighScore()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      ctx.fillStyle = '#2ecc71';
      ctx.font = '20px Arial';
      ctx.fillText('Congratulations! You beat all 3 levels!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(
      isFinal ? 'Click to play again' : 'Click for next level',
      CANVAS_WIDTH / 2,
      isFinal ? CANVAS_HEIGHT / 2 + 120 : CANVAS_HEIGHT / 2 + 90
    );
  }

  /**
   * Render lose screen
   */
  private renderLoseScreen(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${this.score.getCurrent()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    ctx.fillText('Click to retry', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
  }

  /**
   * Handle level completion - finalize score
   */
  private handleLevelComplete(): void {
    this.score.completeLevel();
  }

  /**
   * Handle starting a new game
   */
  private handleNewGame(): void {
    this.score.resetGame();
  }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.start();
});
