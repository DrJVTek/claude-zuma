import { BallColor, BALL_RADIUS } from '../core/types.ts';

/**
 * Renders the player's shooter.
 */
export class ShooterRenderer {
  private ctx: CanvasRenderingContext2D;

  // Color mappings for ball colors
  private readonly colorMap: Record<BallColor, string> = {
    [BallColor.RED]: '#e74c3c',
    [BallColor.BLUE]: '#3498db',
    [BallColor.GREEN]: '#2ecc71',
    [BallColor.YELLOW]: '#f1c40f',
    [BallColor.PURPLE]: '#9b59b6'
  };

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Render the shooter at the given position and rotation
   */
  renderShooter(
    x: number,
    y: number,
    rotation: number,
    currentBall: BallColor,
    reserveBall: BallColor
  ): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(x, y);

    // Draw base (stationary)
    this.drawBase();

    // Draw rotatable turret
    ctx.rotate(rotation);
    this.drawTurret(currentBall);

    ctx.restore();

    // Draw reserve ball indicator below shooter
    this.drawReserveBall(x, y + 50, reserveBall);
  }

  /**
   * Draw the shooter base
   */
  private drawBase(): void {
    const ctx = this.ctx;

    // Base shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(3, 3, 35, 0, Math.PI * 2);
    ctx.fill();

    // Base gradient
    const baseGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 35);
    baseGradient.addColorStop(0, '#5d6d7e');
    baseGradient.addColorStop(0.7, '#34495e');
    baseGradient.addColorStop(1, '#2c3e50');

    ctx.fillStyle = baseGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.fill();

    // Base rim
    ctx.strokeStyle = '#1a252f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * Draw the rotatable turret with current ball
   */
  private drawTurret(currentBall: BallColor): void {
    const ctx = this.ctx;

    // Cannon barrel
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, -8, 45, 16);

    // Barrel highlight
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, -6, 45, 4);

    // Barrel end
    ctx.fillStyle = '#1a252f';
    ctx.fillRect(40, -10, 8, 20);

    // Current ball in barrel
    const ballX = 25;
    const ballY = 0;
    const ballColor = this.colorMap[currentBall];

    // Ball shadow in barrel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(ballX + 1, ballY + 1, BALL_RADIUS - 2, 0, Math.PI * 2);
    ctx.fill();

    // Ball gradient
    const ballGradient = ctx.createRadialGradient(
      ballX - 3, ballY - 3, 0,
      ballX, ballY, BALL_RADIUS - 2
    );
    ballGradient.addColorStop(0, this.lightenColor(ballColor, 30));
    ballGradient.addColorStop(0.5, ballColor);
    ballGradient.addColorStop(1, this.darkenColor(ballColor, 20));

    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS - 2, 0, Math.PI * 2);
    ctx.fill();

    // Ball highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(ballX - 4, ballY - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Center eye
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eye pupil
    ctx.fillStyle = '#1a252f';
    ctx.beginPath();
    ctx.arc(3, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(5, -2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw the reserve ball indicator
   */
  private drawReserveBall(x: number, y: number, color: BallColor): void {
    const ctx = this.ctx;
    const ballColor = this.colorMap[color];
    const radius = 12;

    ctx.save();

    // Label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('NEXT', x, y - 18);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x + 1, y + 1, radius, 0, Math.PI * 2);
    ctx.fill();

    // Ball gradient
    const gradient = ctx.createRadialGradient(
      x - 3, y - 3, 0,
      x, y, radius
    );
    gradient.addColorStop(0, this.lightenColor(ballColor, 30));
    gradient.addColorStop(0.5, ballColor);
    gradient.addColorStop(1, this.darkenColor(ballColor, 20));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Lighten a hex color
   */
  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R}, ${G}, ${B})`;
  }

  /**
   * Darken a hex color
   */
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `rgb(${R}, ${G}, ${B})`;
  }
}
