import { GameStatus } from '../core/types.ts';
import { GameState } from './GameState.ts';
import { TOTAL_LEVELS } from '../levels/index.ts';

/**
 * Manages game state transitions between screens/modes.
 */
export class StateManager {
  private state: GameState;
  private onStateChange: ((newStatus: GameStatus) => void) | null = null;

  constructor(state: GameState) {
    this.state = state;
  }

  /**
   * Set callback for state changes
   */
  setOnStateChange(callback: (newStatus: GameStatus) => void): void {
    this.onStateChange = callback;
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newStatus: GameStatus): void {
    const oldStatus = this.state.status;
    this.state.status = newStatus;

    console.log(`State transition: ${oldStatus} → ${newStatus}`);

    if (this.onStateChange) {
      this.onStateChange(newStatus);
    }
  }

  /**
   * Get current game status
   */
  getStatus(): GameStatus {
    return this.state.status;
  }

  /**
   * Start a new game from the menu
   */
  startGame(): void {
    if (this.state.status !== GameStatus.MENU) return;

    this.state.currentLevel = 1;
    this.state.score.total = 0;
    this.transitionTo(GameStatus.PLAYING);
  }

  /**
   * Start a specific level
   */
  startLevel(levelNumber: number): void {
    this.state.currentLevel = levelNumber;
    this.transitionTo(GameStatus.PLAYING);
  }

  /**
   * Pause the game
   */
  pause(): void {
    if (this.state.status !== GameStatus.PLAYING) return;
    this.transitionTo(GameStatus.PAUSED);
  }

  /**
   * Resume from pause
   */
  resume(): void {
    if (this.state.status !== GameStatus.PAUSED) return;
    this.transitionTo(GameStatus.PLAYING);
  }

  /**
   * Toggle pause state
   */
  togglePause(): void {
    if (this.state.status === GameStatus.PLAYING) {
      this.pause();
    } else if (this.state.status === GameStatus.PAUSED) {
      this.resume();
    }
  }

  /**
   * Trigger win state
   */
  win(): void {
    if (this.state.status !== GameStatus.PLAYING) return;

    // Accumulate score
    this.state.score.total += this.state.score.current;
    this.state.saveHighScore();

    this.transitionTo(GameStatus.WIN);
  }

  /**
   * Trigger lose state
   */
  lose(): void {
    if (this.state.status !== GameStatus.PLAYING) return;

    this.state.saveHighScore();
    this.transitionTo(GameStatus.LOSE);
  }

  /**
   * Go to next level after winning
   */
  nextLevel(): void {
    if (this.state.status !== GameStatus.WIN) return;

    if (this.state.currentLevel < TOTAL_LEVELS) {
      this.state.currentLevel++;
      this.transitionTo(GameStatus.PLAYING);
    } else {
      // Game complete, go to menu
      this.transitionTo(GameStatus.MENU);
    }
  }

  /**
   * Retry current level after losing
   */
  retry(): void {
    if (this.state.status !== GameStatus.LOSE && this.state.status !== GameStatus.WIN) return;
    this.transitionTo(GameStatus.PLAYING);
  }

  /**
   * Quit to menu
   */
  quitToMenu(): void {
    this.state.resetForNewGame();
    this.transitionTo(GameStatus.MENU);
  }

  /**
   * Check if game is currently playing
   */
  isPlaying(): boolean {
    return this.state.status === GameStatus.PLAYING;
  }

  /**
   * Check if game is paused
   */
  isPaused(): boolean {
    return this.state.status === GameStatus.PAUSED;
  }

  /**
   * Check if in menu
   */
  isInMenu(): boolean {
    return this.state.status === GameStatus.MENU;
  }

  /**
   * Check if game just ended (win or lose)
   */
  isGameOver(): boolean {
    return this.state.status === GameStatus.WIN || this.state.status === GameStatus.LOSE;
  }

  /**
   * Check if player won
   */
  hasWon(): boolean {
    return this.state.status === GameStatus.WIN;
  }

  /**
   * Check if player lost
   */
  hasLost(): boolean {
    return this.state.status === GameStatus.LOSE;
  }

  /**
   * Check if it's the final level
   */
  isFinalLevel(): boolean {
    return this.state.currentLevel >= TOTAL_LEVELS;
  }
}
