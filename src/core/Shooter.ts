import { Ball } from './Ball.ts';
import { BallColor, Point, BALL_RADIUS, SHOOTER_COOLDOWN, FIRED_BALL_SPEED, angleToVector } from './types.ts';

/**
 * The player-controlled shooter at the center of the play area.
 */
export class Shooter {
  readonly position: Point;
  rotation: number = 0;
  currentBall: BallColor;
  reserveBall: BallColor;
  cooldown: number = 0;

  private availableColors: BallColor[] = [
    BallColor.RED,
    BallColor.BLUE,
    BallColor.GREEN,
    BallColor.YELLOW
  ];

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.currentBall = this.getRandomColor();
    this.reserveBall = this.getRandomColor();
  }

  /**
   * Set the available colors for this level
   */
  setAvailableColors(colors: BallColor[]): void {
    this.availableColors = colors;
    // Refresh balls with new color set
    this.currentBall = this.getRandomColor();
    this.reserveBall = this.getRandomColor();
  }

  /**
   * Get a random color from available colors
   */
  private getRandomColor(): BallColor {
    const index = Math.floor(Math.random() * this.availableColors.length);
    return this.availableColors[index];
  }

  /**
   * Get a weighted random color based on chain composition
   */
  getWeightedRandomColor(colorCounts: Map<BallColor, number>): BallColor {
    if (colorCounts.size === 0) {
      return this.getRandomColor();
    }

    // Calculate total weight
    let totalWeight = 0;
    for (const count of colorCounts.values()) {
      totalWeight += count;
    }

    // Add small base weight for each available color
    const baseWeight = Math.max(1, totalWeight * 0.1);
    for (const color of this.availableColors) {
      if (!colorCounts.has(color)) {
        colorCounts.set(color, 0);
      }
    }

    totalWeight = 0;
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
   * Aim at a target point
   */
  aimAt(target: Point): void {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    this.rotation = Math.atan2(dy, dx);
  }

  /**
   * Check if shooter can fire (cooldown elapsed)
   */
  canFire(): boolean {
    return this.cooldown <= 0;
  }

  /**
   * Fire a ball in the current aim direction
   * Returns the fired ball or null if on cooldown
   */
  fire(colorCounts?: Map<BallColor, number>): Ball | null {
    if (!this.canFire()) {
      return null;
    }

    // Create the fired ball
    const ball = new Ball(this.currentBall);
    ball.setPosition(this.position.x, this.position.y);

    // Set velocity based on aim direction
    const direction = angleToVector(this.rotation);
    ball.setVelocity(
      direction.x * FIRED_BALL_SPEED,
      direction.y * FIRED_BALL_SPEED
    );

    // Shift balls: current becomes reserve, get new reserve
    this.currentBall = this.reserveBall;
    this.reserveBall = colorCounts
      ? this.getWeightedRandomColor(colorCounts)
      : this.getRandomColor();

    // Start cooldown
    this.cooldown = SHOOTER_COOLDOWN;

    return ball;
  }

  /**
   * Swap current and reserve balls
   */
  swap(): void {
    const temp = this.currentBall;
    this.currentBall = this.reserveBall;
    this.reserveBall = temp;
  }

  /**
   * Update cooldown timer
   */
  update(deltaTime: number): void {
    if (this.cooldown > 0) {
      this.cooldown -= deltaTime * 1000; // Convert to ms
      if (this.cooldown < 0) {
        this.cooldown = 0;
      }
    }
  }

  /**
   * Get the firing direction as a unit vector
   */
  getAimDirection(): Point {
    return angleToVector(this.rotation);
  }

  /**
   * Get the tip position (where ball spawns from)
   */
  getTipPosition(): Point {
    const dir = this.getAimDirection();
    const tipDistance = BALL_RADIUS + 20; // Shooter radius + ball radius
    return {
      x: this.position.x + dir.x * tipDistance,
      y: this.position.y + dir.y * tipDistance
    };
  }
}
