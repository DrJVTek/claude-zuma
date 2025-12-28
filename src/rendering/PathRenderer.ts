import { Path } from '../core/Path.ts';
import { BALL_RADIUS } from '../core/types.ts';

/**
 * Renders the path and hole.
 */
export class PathRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Render the path curve (optional debug visualization)
   */
  renderPath(path: Path, debug: boolean = false): void {
    if (!debug) return;

    const ctx = this.ctx;
    ctx.save();

    // Draw path line
    ctx.strokeStyle = 'rgba(100, 100, 150, 0.5)';
    ctx.lineWidth = BALL_RADIUS * 2 + 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const startPoint = path.getPointAtDistance(0);
    ctx.moveTo(startPoint.x, startPoint.y);

    const steps = 100;
    for (let i = 1; i <= steps; i++) {
      const distance = (i / steps) * path.totalLength;
      const point = path.getPointAtDistance(distance);
      ctx.lineTo(point.x, point.y);
    }

    ctx.stroke();

    // Draw path center line
    ctx.strokeStyle = 'rgba(150, 150, 200, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render the hole (end point where balls enter = game over)
   */
  renderHole(path: Path): void {
    const ctx = this.ctx;
    const holePos = path.holePosition;

    ctx.save();

    // Outer glow
    const gradient = ctx.createRadialGradient(
      holePos.x, holePos.y, 0,
      holePos.x, holePos.y, 40
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(50, 0, 50, 0.5)');
    gradient.addColorStop(1, 'rgba(100, 0, 100, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(holePos.x, holePos.y, 40, 0, Math.PI * 2);
    ctx.fill();

    // Inner hole
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(holePos.x, holePos.y, 25, 0, Math.PI * 2);
    ctx.fill();

    // Hole rim
    ctx.strokeStyle = '#4a0050';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(holePos.x, holePos.y, 25, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render spawn point indicator (optional debug)
   */
  renderSpawnPoint(path: Path): void {
    const ctx = this.ctx;
    const spawnPos = path.spawnPosition;

    ctx.save();

    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(spawnPos.x, spawnPos.y, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}
