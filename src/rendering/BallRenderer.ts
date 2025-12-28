import { Ball } from '../core/Ball.ts';
import { Path } from '../core/Path.ts';
import { BallColor, BallState, BALL_RADIUS, Point } from '../core/types.ts';

/**
 * Renders balls in the chain and fired balls.
 */
export class BallRenderer {
  private ctx: CanvasRenderingContext2D;

  // Color mappings for ball colors
  private readonly colorMap: Record<BallColor, { main: string; light: string; dark: string }> = {
    [BallColor.RED]: { main: '#e74c3c', light: '#f1948a', dark: '#c0392b' },
    [BallColor.BLUE]: { main: '#3498db', light: '#85c1e9', dark: '#2980b9' },
    [BallColor.GREEN]: { main: '#2ecc71', light: '#82e0aa', dark: '#27ae60' },
    [BallColor.YELLOW]: { main: '#f1c40f', light: '#f9e79f', dark: '#d4ac0d' },
    [BallColor.PURPLE]: { main: '#9b59b6', light: '#d7bde2', dark: '#8e44ad' }
  };

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Render a single ball at a given position
   */
  renderBall(ball: Ball, position: Point): void {
    const ctx = this.ctx;
    const colors = this.colorMap[ball.color];

    ctx.save();

    // Handle different ball states
    if (ball.state === BallState.INSERTED) {
      // Scale up slightly for insertion animation
      ctx.translate(position.x, position.y);
      ctx.scale(1.1, 1.1);
      ctx.translate(-position.x, -position.y);
    } else if (ball.state === BallState.EXPLODING) {
      // Exploding balls are handled by Effects renderer
      ctx.restore();
      return;
    }

    // Draw ball shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(position.x + 2, position.y + 2, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw main ball
    const gradient = ctx.createRadialGradient(
      position.x - BALL_RADIUS * 0.3,
      position.y - BALL_RADIUS * 0.3,
      0,
      position.x,
      position.y,
      BALL_RADIUS
    );
    gradient.addColorStop(0, colors.light);
    gradient.addColorStop(0.5, colors.main);
    gradient.addColorStop(1, colors.dark);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(position.x, position.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Draw highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(
      position.x - BALL_RADIUS * 0.3,
      position.y - BALL_RADIUS * 0.3,
      BALL_RADIUS * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw outline
    ctx.strokeStyle = colors.dark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(position.x, position.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Render all balls in the chain
   */
  renderChain(balls: Ball[], path: Path): void {
    for (const ball of balls) {
      if (ball.state === BallState.EXPLODING) continue;

      const position = path.getPointAtDistance(ball.distanceAlongPath);
      this.renderBall(ball, position);
    }
  }

  /**
   * Render fired balls (projectiles)
   */
  renderFiredBalls(balls: Ball[]): void {
    for (const ball of balls) {
      this.renderBall(ball, { x: ball.x, y: ball.y });
    }
  }

  /**
   * Get the CSS color string for a ball color
   */
  getColorString(color: BallColor): string {
    return this.colorMap[color].main;
  }
}
