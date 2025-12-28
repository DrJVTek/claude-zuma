import { Ball } from './Ball.ts';
import { Chain } from './Chain.ts';
import { Path } from './Path.ts';
import { Point, BallColor, BALL_RADIUS, distance } from './types.ts';

/**
 * Collision detection and match finding logic.
 */

export interface CollisionResult {
  collidedWith: Ball;
  insertBefore: boolean;
  insertionDistance: number;
}

export interface MatchResult {
  balls: Ball[];
  color: BallColor;
}

/**
 * Check if a fired ball collides with any ball in the chain.
 * Returns collision info or null if no collision.
 */
export function checkBallChainCollision(
  firedBall: Ball,
  chain: Chain,
  path: Path
): CollisionResult | null {
  const firedPos: Point = { x: firedBall.x, y: firedBall.y };
  const collisionDistance = BALL_RADIUS * 2;

  let closestBall: Ball | null = null;
  let closestDist = Infinity;
  let closestPathDist = 0;

  // Check collision with each ball in chain
  let current = chain.head;
  while (current) {
    const ballPos = path.getPointAtDistance(current.distanceAlongPath);
    const dist = distance(firedPos, ballPos);

    if (dist < collisionDistance && dist < closestDist) {
      closestBall = current;
      closestDist = dist;
      closestPathDist = current.distanceAlongPath;
    }

    current = current.next;
  }

  if (!closestBall) {
    return null;
  }

  // Determine if we should insert before or after the collided ball
  // Based on which side of the ball the fired ball hit
  const collidedPos = path.getPointAtDistance(closestBall.distanceAlongPath);
  const tangent = path.getTangentAtDistance(closestBall.distanceAlongPath);

  // Vector from collided ball to fired ball
  const toFired = {
    x: firedPos.x - collidedPos.x,
    y: firedPos.y - collidedPos.y
  };

  // Dot product with tangent to determine side
  const dot = toFired.x * tangent.x + toFired.y * tangent.y;
  const insertBefore = dot < 0;

  // Calculate insertion distance
  let insertionDistance: number;
  if (insertBefore) {
    insertionDistance = closestPathDist - BALL_RADIUS * 2;
  } else {
    insertionDistance = closestPathDist + BALL_RADIUS * 2;
  }

  return {
    collidedWith: closestBall,
    insertBefore,
    insertionDistance: Math.max(0, insertionDistance)
  };
}

/**
 * Check if the head ball has reached the hole (game over condition).
 */
export function checkHoleCollision(chain: Chain): boolean {
  if (chain.isEmpty()) return false;

  const headBall = chain.getFrontBall();
  if (!headBall) return false;

  return headBall.distanceAlongPath <= 0;
}

/**
 * Find all balls that form a match (3+ same color) starting from a given ball.
 * Scans in both directions along the chain.
 */
export function findMatch(startBall: Ball): MatchResult | null {
  const color = startBall.color;
  const matchingBalls: Ball[] = [startBall];

  // Scan backward (toward head)
  let current = startBall.prev;
  while (current && current.color === color) {
    matchingBalls.unshift(current);
    current = current.prev;
  }

  // Scan forward (toward tail)
  current = startBall.next;
  while (current && current.color === color) {
    matchingBalls.push(current);
    current = current.next;
  }

  // Need 3+ balls for a match
  if (matchingBalls.length >= 3) {
    return { balls: matchingBalls, color };
  }

  return null;
}

/**
 * Check if removing balls will create a chain reaction opportunity.
 * Returns the colors at the gap if they match.
 */
export function willCreateChainReaction(
  ballsToRemove: Ball[]
): { frontColor: BallColor; backColor: BallColor } | null {
  if (ballsToRemove.length === 0) return null;

  // Find front and back boundaries
  ballsToRemove.sort((a, b) => a.distanceAlongPath - b.distanceAlongPath);

  const frontBall = ballsToRemove[0].prev;
  const backBall = ballsToRemove[ballsToRemove.length - 1].next;

  // Check if both sides exist and have matching colors
  if (frontBall && backBall && frontBall.color === backBall.color) {
    return {
      frontColor: frontBall.color,
      backColor: backBall.color
    };
  }

  return null;
}

/**
 * Check for a chain reaction after gap closes.
 * Returns matched balls if colors match at the gap, null otherwise.
 */
export function checkChainReaction(
  frontBall: Ball | null,
  backBall: Ball | null
): MatchResult | null {
  if (!frontBall || !backBall) return null;
  if (frontBall.color !== backBall.color) return null;

  // Colors match - scan for full match from the connection point
  const color = frontBall.color;
  const matchingBalls: Ball[] = [];

  // Scan backward from front ball
  let current: Ball | null = frontBall;
  while (current && current.color === color) {
    matchingBalls.unshift(current);
    current = current.prev;
  }

  // Scan forward from back ball
  current = backBall;
  while (current && current.color === color) {
    matchingBalls.push(current);
    current = current.next;
  }

  if (matchingBalls.length >= 3) {
    return { balls: matchingBalls, color };
  }

  return null;
}

/**
 * Find the closest point on the path to the fired ball's trajectory.
 * Used for determining where a ball will hit the path.
 */
export function findPathIntersection(
  startPos: Point,
  direction: Point,
  path: Path,
  maxDistance: number = 1000
): { distance: number; pathDistance: number } | null {
  const step = 10; // Check every 10 pixels
  let bestPathDist = -1;
  let bestDist = Infinity;

  for (let d = 0; d <= maxDistance; d += step) {
    const testPos = {
      x: startPos.x + direction.x * d,
      y: startPos.y + direction.y * d
    };

    const pathDist = path.getClosestDistance(testPos);
    const pathPoint = path.getPointAtDistance(pathDist);
    const dist = distance(testPos, pathPoint);

    if (dist < BALL_RADIUS * 2 && dist < bestDist) {
      bestDist = dist;
      bestPathDist = pathDist;
    }
  }

  if (bestPathDist >= 0) {
    return { distance: bestDist, pathDistance: bestPathDist };
  }

  return null;
}
