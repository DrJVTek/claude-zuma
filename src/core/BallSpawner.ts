import { Ball } from './Ball.ts';
import { Chain } from './Chain.ts';
import { Path } from './Path.ts';
import { BallColor, BALL_RADIUS } from './types.ts';

/**
 * Handles spawning new balls into the chain.
 */
export class BallSpawner {
  private availableColors: BallColor[];
  private spawnRate: number; // Balls per second
  private accumulator: number = 0;

  constructor(colors: BallColor[], spawnRate: number = 1) {
    this.availableColors = colors;
    this.spawnRate = spawnRate;
  }

  /**
   * Set available colors for spawning
   */
  setColors(colors: BallColor[]): void {
    this.availableColors = colors;
  }

  /**
   * Set spawn rate (balls per second)
   */
  setSpawnRate(rate: number): void {
    this.spawnRate = rate;
  }

  /**
   * Get a weighted random color based on chain composition.
   * Colors with more balls in the chain have higher probability.
   */
  getWeightedRandomColor(chain: Chain): BallColor {
    // Count colors in chain
    const colorCounts = this.countChainColors(chain);

    if (colorCounts.size === 0) {
      return this.getRandomColor();
    }

    // Calculate total weight (add base weight for fairness)
    const baseWeight = 1;
    let totalWeight = 0;

    for (const color of this.availableColors) {
      totalWeight += (colorCounts.get(color) ?? 0) + baseWeight;
    }

    // Pick weighted random
    let random = Math.random() * totalWeight;

    for (const color of this.availableColors) {
      const weight = (colorCounts.get(color) ?? 0) + baseWeight;
      random -= weight;
      if (random <= 0) {
        return color;
      }
    }

    return this.getRandomColor();
  }

  /**
   * Get a purely random color
   */
  getRandomColor(): BallColor {
    const index = Math.floor(Math.random() * this.availableColors.length);
    return this.availableColors[index];
  }

  /**
   * Count occurrences of each color in the chain
   */
  countChainColors(chain: Chain): Map<BallColor, number> {
    const counts = new Map<BallColor, number>();

    for (const ball of chain.getBalls()) {
      const current = counts.get(ball.color) ?? 0;
      counts.set(ball.color, current + 1);
    }

    return counts;
  }

  /**
   * Spawn a new ball at the path start (spawn point).
   * Returns the spawned ball or null if chain tail is too close.
   */
  spawnBall(chain: Chain, path: Path): Ball | null {
    const spawnDistance = path.totalLength;
    const minSpacing = BALL_RADIUS * 2;

    // Check if there's room at spawn point
    if (chain.tail) {
      const tailDistance = chain.tail.distanceAlongPath;
      if (spawnDistance - tailDistance < minSpacing) {
        return null; // Not enough room
      }
    }

    // Create new ball with weighted random color
    const color = this.getWeightedRandomColor(chain);
    const ball = new Ball(color, spawnDistance);

    // Add to chain
    if (chain.tail) {
      chain.insertBall(ball, chain.tail);
    } else {
      chain.insertBall(ball, null);
    }

    return ball;
  }

  /**
   * Update spawner and spawn balls based on elapsed time.
   * Returns number of balls spawned.
   */
  update(deltaTime: number, chain: Chain, path: Path, maxBalls: number): number {
    this.accumulator += deltaTime;

    const spawnInterval = 1 / this.spawnRate;
    let spawned = 0;

    while (this.accumulator >= spawnInterval && chain.getLength() < maxBalls) {
      const ball = this.spawnBall(chain, path);
      if (ball) {
        spawned++;
      }
      this.accumulator -= spawnInterval;
    }

    return spawned;
  }

  /**
   * Reset spawner state
   */
  reset(): void {
    this.accumulator = 0;
  }

  /**
   * Spawn initial balls for level start
   */
  spawnInitialBalls(chain: Chain, path: Path, count: number): void {
    const spacing = BALL_RADIUS * 2;
    let currentDistance = path.totalLength;

    for (let i = 0; i < count; i++) {
      const color = this.getRandomColor();
      const ball = new Ball(color, currentDistance);

      if (chain.tail) {
        chain.insertBall(ball, chain.tail);
      } else {
        chain.insertBall(ball, null);
      }

      currentDistance -= spacing;
    }
  }
}
