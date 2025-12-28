import { BallColor, BALL_RADIUS } from '../core/types.ts';

/**
 * Particle for explosion effects.
 */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
}

/**
 * Explosion effect data.
 */
export interface Explosion {
  x: number;
  y: number;
  color: BallColor;
  progress: number;
  particles: Particle[];
}

/**
 * Renders visual effects like explosions and particles.
 */
export class EffectsRenderer {
  private ctx: CanvasRenderingContext2D;
  private explosions: Explosion[] = [];

  // Color mappings
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
   * Create a new explosion effect
   */
  createExplosion(x: number, y: number, color: BallColor): void {
    const particles: Particle[] = [];
    const particleCount = 12;
    const baseColor = this.colorMap[color];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 100 + Math.random() * 150;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: BALL_RADIUS * 0.3 + Math.random() * BALL_RADIUS * 0.3,
        color: baseColor,
        alpha: 1,
        life: 0.5 + Math.random() * 0.3
      });
    }

    this.explosions.push({
      x,
      y,
      color,
      progress: 0,
      particles
    });
  }

  /**
   * Update all explosion effects
   */
  update(deltaTime: number): void {
    // Update particles
    for (const explosion of this.explosions) {
      explosion.progress += deltaTime * 2;

      for (const particle of explosion.particles) {
        particle.x += particle.vx * deltaTime;
        particle.y += particle.vy * deltaTime;
        particle.vy += 200 * deltaTime; // Gravity
        particle.alpha = Math.max(0, 1 - explosion.progress);
        particle.radius *= 0.98;
      }
    }

    // Remove finished explosions
    this.explosions = this.explosions.filter(e => e.progress < 1);
  }

  /**
   * Render all explosion effects
   */
  render(): void {
    const ctx = this.ctx;

    for (const explosion of this.explosions) {
      // Draw shockwave ring
      this.drawShockwave(explosion);

      // Draw particles
      for (const particle of explosion.particles) {
        if (particle.alpha <= 0) continue;

        ctx.save();
        ctx.globalAlpha = particle.alpha;

        // Particle glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 2
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Particle core
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }
  }

  /**
   * Draw expanding shockwave ring
   */
  private drawShockwave(explosion: Explosion): void {
    const ctx = this.ctx;
    const radius = BALL_RADIUS + explosion.progress * 50;
    const alpha = Math.max(0, 0.5 - explosion.progress * 0.5);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = this.colorMap[explosion.color];
    ctx.lineWidth = 3 * (1 - explosion.progress);
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Check if there are any active explosions
   */
  hasActiveExplosions(): boolean {
    return this.explosions.length > 0;
  }

  /**
   * Clear all explosions
   */
  clear(): void {
    this.explosions = [];
  }

  /**
   * Create a score popup effect
   */
  createScorePopup(x: number, y: number, score: number): void {
    // Score popups could be added here
    // For now, just a placeholder
  }
}
