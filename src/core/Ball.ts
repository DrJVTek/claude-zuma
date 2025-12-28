import { BallColor, BallState, generateId } from './types.ts';

/**
 * Represents a colored ball in the game.
 * Can be part of the chain or a fired projectile.
 */
export class Ball {
  readonly id: string;
  color: BallColor;
  distanceAlongPath: number;
  state: BallState;

  // Linked list pointers for chain
  prev: Ball | null = null;
  next: Ball | null = null;

  // For fired balls: position and velocity
  x: number = 0;
  y: number = 0;
  velocityX: number = 0;
  velocityY: number = 0;

  constructor(color: BallColor, distanceAlongPath: number = 0) {
    this.id = generateId();
    this.color = color;
    this.distanceAlongPath = distanceAlongPath;
    this.state = BallState.NORMAL;
  }

  /**
   * Create a copy of this ball (for firing from shooter)
   */
  clone(): Ball {
    const ball = new Ball(this.color, this.distanceAlongPath);
    ball.x = this.x;
    ball.y = this.y;
    ball.velocityX = this.velocityX;
    ball.velocityY = this.velocityY;
    ball.state = this.state;
    return ball;
  }

  /**
   * Set the ball's world position (for rendering or collision)
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * Set velocity for fired balls
   */
  setVelocity(vx: number, vy: number): void {
    this.velocityX = vx;
    this.velocityY = vy;
  }

  /**
   * Update position for fired balls based on velocity
   */
  updatePosition(deltaTime: number): void {
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }

  /**
   * Check if ball is off-screen (for cleanup)
   */
  isOffScreen(width: number, height: number, margin: number = 50): boolean {
    return (
      this.x < -margin ||
      this.x > width + margin ||
      this.y < -margin ||
      this.y > height + margin
    );
  }

  /**
   * Mark ball as exploding (matched)
   */
  startExploding(): void {
    this.state = BallState.EXPLODING;
  }

  /**
   * Check if ball is currently exploding
   */
  isExploding(): boolean {
    return this.state === BallState.EXPLODING;
  }

  /**
   * Mark ball as just inserted (for animation)
   */
  markInserted(): void {
    this.state = BallState.INSERTED;
  }

  /**
   * Reset to normal state
   */
  resetState(): void {
    this.state = BallState.NORMAL;
  }
}
