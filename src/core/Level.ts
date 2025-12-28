import { Path } from './Path.ts';
import { BallColor, Point } from './types.ts';

/**
 * Level configuration interface.
 */
export interface LevelConfig {
  id: number;
  name: string;
  path: Path;
  colors: BallColor[];
  ballSpeed: number;        // Pixels per second
  spawnRate: number;        // Balls per second
  spawnThreshold: number;   // Total balls to spawn before stopping
  initialBallCount: number; // Balls in chain at level start
}

/**
 * Creates a Path from control point arrays.
 */
export function createPath(id: string, points: Point[]): Path {
  return new Path(id, points);
}

/**
 * Generate a spiral path centered at a point.
 * Returns control points for a Bezier curve.
 */
export function generateSpiralPath(
  centerX: number,
  centerY: number,
  startRadius: number,
  endRadius: number,
  turns: number = 2,
  segments: number = 8
): Point[] {
  const points: Point[] = [];
  const totalPoints = segments * turns + 1;

  for (let i = 0; i < totalPoints; i++) {
    const t = i / (totalPoints - 1);
    const angle = t * turns * Math.PI * 2;
    const radius = startRadius + (endRadius - startRadius) * t;

    // Main point
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push({ x, y });

    // Add control points for smooth Bezier curves
    if (i < totalPoints - 1) {
      const nextT = (i + 1) / (totalPoints - 1);
      const nextAngle = nextT * turns * Math.PI * 2;
      const nextRadius = startRadius + (endRadius - startRadius) * nextT;

      // Control point 1 (1/3 toward next)
      const ctrl1Angle = angle + (nextAngle - angle) / 3;
      const ctrl1Radius = radius + (nextRadius - radius) / 3;
      points.push({
        x: centerX + Math.cos(ctrl1Angle) * ctrl1Radius,
        y: centerY + Math.sin(ctrl1Angle) * ctrl1Radius
      });

      // Control point 2 (2/3 toward next)
      const ctrl2Angle = angle + (nextAngle - angle) * 2 / 3;
      const ctrl2Radius = radius + (nextRadius - radius) * 2 / 3;
      points.push({
        x: centerX + Math.cos(ctrl2Angle) * ctrl2Radius,
        y: centerY + Math.sin(ctrl2Angle) * ctrl2Radius
      });
    }
  }

  return points;
}

/**
 * Generate a winding S-curve path.
 */
export function generateSCurvePath(
  startX: number,
  startY: number,
  width: number,
  height: number,
  waves: number = 2
): Point[] {
  const points: Point[] = [];
  const segmentHeight = height / waves;

  for (let i = 0; i <= waves; i++) {
    const y = startY + i * segmentHeight;
    const direction = i % 2 === 0 ? 1 : -1;

    if (i === 0) {
      // Start point
      points.push({ x: startX, y });
    } else {
      // Previous curve end
      const prevY = startY + (i - 1) * segmentHeight;
      const prevDirection = (i - 1) % 2 === 0 ? 1 : -1;

      // Control points for S-curve
      points.push({
        x: startX + prevDirection * width,
        y: prevY + segmentHeight * 0.3
      });
      points.push({
        x: startX + direction * width,
        y: y - segmentHeight * 0.3
      });
      points.push({
        x: startX + direction * width * 0.5,
        y
      });
    }
  }

  return points;
}

/**
 * Generate a figure-8 path.
 */
export function generateFigure8Path(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  segments: number = 16
): Point[] {
  const points: Point[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2;

    // Figure-8 parametric equations
    const x = centerX + radiusX * Math.sin(angle);
    const y = centerY + radiusY * Math.sin(angle) * Math.cos(angle);

    points.push({ x, y });

    // Add control points
    if (i < segments) {
      const nextT = (i + 1) / segments;
      const nextAngle = nextT * Math.PI * 2;

      const midAngle = (angle + nextAngle) / 2;
      const midX = centerX + radiusX * Math.sin(midAngle);
      const midY = centerY + radiusY * Math.sin(midAngle) * Math.cos(midAngle);

      // Simple interpolation for control points
      points.push({ x: (x + midX) / 2, y: (y + midY) / 2 });
      const nextX = centerX + radiusX * Math.sin(nextAngle);
      const nextY = centerY + radiusY * Math.sin(nextAngle) * Math.cos(nextAngle);
      points.push({ x: (midX + nextX) / 2, y: (midY + nextY) / 2 });
    }
  }

  return points;
}
