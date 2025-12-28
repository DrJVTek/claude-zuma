/**
 * Score tracking with chain reaction multipliers and high score persistence.
 */
export class Score {
  private current: number = 0;
  private total: number = 0;
  private chainMultiplier: number = 1;
  private highScore: number = 0;
  private readonly storageKey = 'zuma-high-score';

  constructor() {
    this.loadHighScore();
  }

  /**
   * Add points for a match based on number of balls matched
   * - 3 balls: 100 points
   * - 4 balls: 150 points
   * - 5+ balls: 200 + 50 * extra balls
   */
  addMatchPoints(ballCount: number): number {
    let basePoints: number;

    if (ballCount === 3) {
      basePoints = 100;
    } else if (ballCount === 4) {
      basePoints = 150;
    } else if (ballCount >= 5) {
      basePoints = 200 + 50 * (ballCount - 5);
    } else {
      return 0; // No points for less than 3 balls
    }

    const points = basePoints * this.chainMultiplier;
    this.current += points;
    return points;
  }

  /**
   * Increment chain multiplier after a chain reaction
   */
  incrementChainMultiplier(): void {
    this.chainMultiplier++;
  }

  /**
   * Reset chain multiplier when no match occurs after gap close
   */
  resetChainMultiplier(): void {
    this.chainMultiplier = 1;
  }

  /**
   * Get the current chain multiplier
   */
  getChainMultiplier(): number {
    return this.chainMultiplier;
  }

  /**
   * Get current level score
   */
  getCurrent(): number {
    return this.current;
  }

  /**
   * Get total score across all levels
   */
  getTotal(): number {
    return this.total;
  }

  /**
   * Get high score
   */
  getHighScore(): number {
    return this.highScore;
  }

  /**
   * Reset score for new level
   */
  resetLevel(): void {
    this.current = 0;
    this.chainMultiplier = 1;
  }

  /**
   * Complete level - add current to total
   */
  completeLevel(): void {
    this.total += this.current;
    this.updateHighScore();
  }

  /**
   * Reset all scores for new game
   */
  resetGame(): void {
    this.current = 0;
    this.total = 0;
    this.chainMultiplier = 1;
  }

  /**
   * Update high score if current total is higher
   */
  private updateHighScore(): void {
    if (this.total > this.highScore) {
      this.highScore = this.total;
      this.saveHighScore();
    }
  }

  /**
   * Save high score to localStorage
   */
  saveHighScore(): void {
    try {
      localStorage.setItem(this.storageKey, this.highScore.toString());
    } catch (e) {
      // localStorage not available, ignore
    }
  }

  /**
   * Load high score from localStorage
   */
  loadHighScore(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.highScore = parseInt(stored, 10) || 0;
      }
    } catch (e) {
      // localStorage not available, ignore
    }
  }
}
