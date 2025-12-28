import { Ball } from './Ball.ts';
import { BallColor, BALL_RADIUS, SNAP_BACK_SPEED } from './types.ts';

/**
 * Represents the chain of balls moving along the path.
 * Implemented as a doubly-linked list for efficient insertion/removal.
 */
export class Chain {
  head: Ball | null = null;  // Closest to hole (lowest distance)
  tail: Ball | null = null;  // Closest to spawn (highest distance)
  velocity: number = 50;     // Movement speed in pixels/sec

  // Gap closing state
  splitPoint: number | null = null;
  backVelocity: number = 0;
  private isClosingGap: boolean = false;

  /**
   * Insert a ball into the chain at the correct position based on distance
   */
  insertBall(ball: Ball, afterBall: Ball | null = null): void {
    if (afterBall === null) {
      // Insert at head
      ball.prev = null;
      ball.next = this.head;
      if (this.head) {
        this.head.prev = ball;
      }
      this.head = ball;
      if (!this.tail) {
        this.tail = ball;
      }
    } else {
      // Insert after the specified ball
      ball.prev = afterBall;
      ball.next = afterBall.next;
      if (afterBall.next) {
        afterBall.next.prev = ball;
      }
      afterBall.next = ball;
      if (afterBall === this.tail) {
        this.tail = ball;
      }
    }

    // Adjust positions to make room
    this.pushBallsBack(ball);
  }

  /**
   * Push balls behind the inserted ball to make room
   */
  private pushBallsBack(insertedBall: Ball): void {
    const minSpacing = BALL_RADIUS * 2;
    let current = insertedBall.next;
    let prevDistance = insertedBall.distanceAlongPath;

    while (current) {
      if (current.distanceAlongPath < prevDistance + minSpacing) {
        current.distanceAlongPath = prevDistance + minSpacing;
      }
      prevDistance = current.distanceAlongPath;
      current = current.next;
    }
  }

  /**
   * Remove a ball from the chain
   */
  removeBall(ball: Ball): void {
    if (ball.prev) {
      ball.prev.next = ball.next;
    } else {
      this.head = ball.next;
    }

    if (ball.next) {
      ball.next.prev = ball.prev;
    } else {
      this.tail = ball.prev;
    }

    ball.prev = null;
    ball.next = null;
  }

  /**
   * Remove multiple balls and initiate gap closing
   */
  removeBalls(balls: Ball[]): { frontBall: Ball | null; backBall: Ball | null } {
    if (balls.length === 0) return { frontBall: null, backBall: null };

    // Sort by distance to find front and back boundaries
    balls.sort((a, b) => a.distanceAlongPath - b.distanceAlongPath);

    const frontBall = balls[0].prev;
    const backBall = balls[balls.length - 1].next;

    // Remove all matched balls
    for (const ball of balls) {
      this.removeBall(ball);
    }

    // Initiate gap closing if there are balls on both sides
    if (frontBall && backBall) {
      this.splitPoint = frontBall.distanceAlongPath + BALL_RADIUS * 2;
      this.backVelocity = -SNAP_BACK_SPEED;
      this.isClosingGap = true;
    }

    return { frontBall, backBall };
  }

  /**
   * Get all balls as an array (for iteration/rendering)
   */
  getBalls(): Ball[] {
    const balls: Ball[] = [];
    let current = this.head;
    while (current) {
      balls.push(current);
      current = current.next;
    }
    return balls;
  }

  /**
   * Check if the chain is empty
   */
  isEmpty(): boolean {
    return this.head === null;
  }

  /**
   * Get the number of balls in the chain
   */
  getLength(): number {
    let count = 0;
    let current = this.head;
    while (current) {
      count++;
      current = current.next;
    }
    return count;
  }

  /**
   * Update chain positions (movement toward hole)
   */
  update(deltaTime: number): void {
    if (this.isClosingGap) {
      this.updateGapClosing(deltaTime);
    } else {
      this.updateNormalMovement(deltaTime);
    }
  }

  /**
   * Normal movement: all balls move toward hole
   */
  private updateNormalMovement(deltaTime: number): void {
    const movement = this.velocity * deltaTime;
    let current = this.head;
    while (current) {
      current.distanceAlongPath -= movement;
      current = current.next;
    }
  }

  /**
   * Gap closing: back portion moves toward front
   */
  private updateGapClosing(deltaTime: number): void {
    if (this.splitPoint === null) return;

    // Move back portion toward front
    const backMovement = this.backVelocity * deltaTime;
    let current = this.head;
    let backStart: Ball | null = null;

    // Find where back portion starts
    while (current) {
      if (current.distanceAlongPath >= this.splitPoint) {
        backStart = current;
        break;
      }
      current = current.next;
    }

    // Move all balls in back portion
    if (backStart) {
      current = backStart;
      while (current) {
        current.distanceAlongPath += backMovement;
        current = current.next;
      }

      // Check if gap is closed
      const frontBall = backStart.prev;
      if (frontBall) {
        const gap = backStart.distanceAlongPath - frontBall.distanceAlongPath;
        if (gap <= BALL_RADIUS * 2) {
          // Gap closed, snap to position
          this.snapGapClosed(frontBall, backStart);
        }
      }
    }
  }

  /**
   * Snap balls together when gap closes
   */
  private snapGapClosed(frontBall: Ball, backBall: Ball): void {
    // Position back ball adjacent to front ball
    backBall.distanceAlongPath = frontBall.distanceAlongPath + BALL_RADIUS * 2;

    // Reposition rest of chain
    let current = backBall.next;
    let prevDistance = backBall.distanceAlongPath;
    while (current) {
      current.distanceAlongPath = prevDistance + BALL_RADIUS * 2;
      prevDistance = current.distanceAlongPath;
      current = current.next;
    }

    // End gap closing
    this.splitPoint = null;
    this.backVelocity = 0;
    this.isClosingGap = false;
  }

  /**
   * Check if a gap is currently closing
   */
  isGapClosing(): boolean {
    return this.isClosingGap;
  }

  /**
   * Get the colors at the gap (for chain reaction check)
   */
  getGapColors(): { front: BallColor | null; back: BallColor | null } {
    if (!this.splitPoint) return { front: null, back: null };

    let frontBall: Ball | null = null;
    let backBall: Ball | null = null;

    let current = this.head;
    while (current) {
      if (current.distanceAlongPath < this.splitPoint) {
        frontBall = current;
      } else if (!backBall) {
        backBall = current;
        break;
      }
      current = current.next;
    }

    return {
      front: frontBall?.color ?? null,
      back: backBall?.color ?? null
    };
  }

  /**
   * Find the ball at a given distance (for insertion)
   */
  findBallAtDistance(distance: number): Ball | null {
    let current = this.head;
    while (current) {
      if (Math.abs(current.distanceAlongPath - distance) < BALL_RADIUS * 2) {
        return current;
      }
      current = current.next;
    }
    return null;
  }

  /**
   * Find insertion point for a ball at given distance
   * Returns the ball after which to insert, or null for head
   */
  findInsertionPoint(distance: number): Ball | null {
    let current = this.head;
    let insertAfter: Ball | null = null;

    while (current && current.distanceAlongPath < distance) {
      insertAfter = current;
      current = current.next;
    }

    return insertAfter;
  }

  /**
   * Get the color of the ball at the front of the chain (closest to hole)
   */
  getFrontBall(): Ball | null {
    return this.head;
  }

  /**
   * Clear all balls from the chain
   */
  clear(): void {
    this.head = null;
    this.tail = null;
    this.splitPoint = null;
    this.backVelocity = 0;
    this.isClosingGap = false;
  }
}
