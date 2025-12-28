import { Point, Vector } from './types.ts';

/**
 * Represents a curved path defined by Bezier control points.
 * Balls travel along this path from spawn point to hole.
 */
export class Path {
  readonly id: string;
  readonly controlPoints: Point[];
  readonly totalLength: number;
  readonly holePosition: Point;
  readonly spawnPosition: Point;

  // Pre-calculated lookup table for arc length parameterization
  private arcLengthTable: number[] = [];
  private readonly SEGMENTS_PER_CURVE = 50;

  constructor(id: string, controlPoints: Point[]) {
    if (controlPoints.length < 4) {
      throw new Error('Path requires at least 4 control points');
    }

    this.id = id;
    this.controlPoints = controlPoints;
    this.totalLength = this.calculateTotalLength();
    this.holePosition = this.getPointAtT(0);
    this.spawnPosition = this.getPointAtT(1);
    this.buildArcLengthTable();
  }

  /**
   * Get a point on the path at a given distance from the hole (0 = hole, totalLength = spawn)
   */
  getPointAtDistance(distance: number): Point {
    const t = this.distanceToT(distance);
    return this.getPointAtT(t);
  }

  /**
   * Get the tangent (direction) vector at a given distance
   */
  getTangentAtDistance(distance: number): Vector {
    const t = this.distanceToT(distance);
    return this.getTangentAtT(t);
  }

  /**
   * Find the closest distance along the path to a given point
   */
  getClosestDistance(point: Point): number {
    let closestT = 0;
    let closestDist = Infinity;

    // Sample the path to find closest point
    const samples = 100;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const pathPoint = this.getPointAtT(t);
      const dx = pathPoint.x - point.x;
      const dy = pathPoint.y - point.y;
      const dist = dx * dx + dy * dy;

      if (dist < closestDist) {
        closestDist = dist;
        closestT = t;
      }
    }

    return this.tToDistance(closestT);
  }

  /**
   * Calculate point on cubic Bezier curve at parameter t (0-1)
   */
  private getPointAtT(t: number): Point {
    t = Math.max(0, Math.min(1, t));

    // For multiple curve segments, find which segment t falls into
    const numSegments = Math.floor((this.controlPoints.length - 1) / 3);
    const segmentT = t * numSegments;
    const segmentIndex = Math.min(Math.floor(segmentT), numSegments - 1);
    const localT = segmentT - segmentIndex;

    const i = segmentIndex * 3;
    const p0 = this.controlPoints[i];
    const p1 = this.controlPoints[i + 1];
    const p2 = this.controlPoints[i + 2];
    const p3 = this.controlPoints[i + 3];

    return this.cubicBezier(p0, p1, p2, p3, localT);
  }

  /**
   * Calculate tangent on cubic Bezier curve at parameter t
   */
  private getTangentAtT(t: number): Vector {
    t = Math.max(0, Math.min(1, t));

    const numSegments = Math.floor((this.controlPoints.length - 1) / 3);
    const segmentT = t * numSegments;
    const segmentIndex = Math.min(Math.floor(segmentT), numSegments - 1);
    const localT = segmentT - segmentIndex;

    const i = segmentIndex * 3;
    const p0 = this.controlPoints[i];
    const p1 = this.controlPoints[i + 1];
    const p2 = this.controlPoints[i + 2];
    const p3 = this.controlPoints[i + 3];

    return this.cubicBezierDerivative(p0, p1, p2, p3, localT);
  }

  /**
   * Cubic Bezier interpolation
   */
  private cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;

    return {
      x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
    };
  }

  /**
   * Cubic Bezier derivative (tangent)
   */
  private cubicBezierDerivative(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Vector {
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;

    const dx = 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x);
    const dy = 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y);

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return { x: 1, y: 0 };

    return { x: dx / len, y: dy / len };
  }

  /**
   * Calculate total path length by integration
   */
  private calculateTotalLength(): number {
    let length = 0;
    const steps = this.SEGMENTS_PER_CURVE * Math.floor((this.controlPoints.length - 1) / 3);
    let prevPoint = this.getPointAtT(0);

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const point = this.getPointAtT(t);
      const dx = point.x - prevPoint.x;
      const dy = point.y - prevPoint.y;
      length += Math.sqrt(dx * dx + dy * dy);
      prevPoint = point;
    }

    return length;
  }

  /**
   * Build lookup table for arc length parameterization
   */
  private buildArcLengthTable(): void {
    const steps = this.SEGMENTS_PER_CURVE * Math.floor((this.controlPoints.length - 1) / 3);
    this.arcLengthTable = [0];
    let length = 0;
    let prevPoint = this.getPointAtT(0);

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const point = this.getPointAtT(t);
      const dx = point.x - prevPoint.x;
      const dy = point.y - prevPoint.y;
      length += Math.sqrt(dx * dx + dy * dy);
      this.arcLengthTable.push(length);
      prevPoint = point;
    }
  }

  /**
   * Convert distance along path to t parameter
   */
  private distanceToT(distance: number): number {
    distance = Math.max(0, Math.min(this.totalLength, distance));

    // Binary search in arc length table
    let low = 0;
    let high = this.arcLengthTable.length - 1;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.arcLengthTable[mid] < distance) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    if (low === 0) return 0;

    // Interpolate between table entries
    const d0 = this.arcLengthTable[low - 1];
    const d1 = this.arcLengthTable[low];
    const frac = (distance - d0) / (d1 - d0);

    return (low - 1 + frac) / (this.arcLengthTable.length - 1);
  }

  /**
   * Convert t parameter to distance along path
   */
  private tToDistance(t: number): number {
    t = Math.max(0, Math.min(1, t));
    const index = t * (this.arcLengthTable.length - 1);
    const low = Math.floor(index);
    const high = Math.ceil(index);
    const frac = index - low;

    if (low === high) return this.arcLengthTable[low];

    return this.arcLengthTable[low] + frac * (this.arcLengthTable[high] - this.arcLengthTable[low]);
  }
}
