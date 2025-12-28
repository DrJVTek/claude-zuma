import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/types.ts';

/**
 * Base renderer handling canvas setup and game loop.
 */
export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;

  private lastTime: number = 0;
  private isRunning: boolean = false;
  private updateCallback: ((deltaTime: number) => void) | null = null;
  private renderCallback: (() => void) | null = null;
  private backgroundGradient: CanvasGradient | null = null;

  constructor(canvasId: string = 'game-canvas') {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }

    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width || CANVAS_WIDTH;
    this.height = canvas.height || CANVAS_HEIGHT;

    // Create background gradient
    this.backgroundGradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height)
    );
    this.backgroundGradient.addColorStop(0, '#1a1a2e');
    this.backgroundGradient.addColorStop(0.5, '#16213e');
    this.backgroundGradient.addColorStop(1, '#0f3460');
  }

  /**
   * Clear the canvas with background gradient
   */
  clear(): void {
    if (this.backgroundGradient) {
      this.ctx.fillStyle = this.backgroundGradient;
    } else {
      this.ctx.fillStyle = '#16213e';
    }
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Set the update callback (game logic)
   */
  onUpdate(callback: (deltaTime: number) => void): void {
    this.updateCallback = callback;
  }

  /**
   * Set the render callback (drawing)
   */
  onRender(callback: () => void): void {
    this.renderCallback = callback;
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Main game loop using requestAnimationFrame
   */
  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

    // Calculate delta time in seconds
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // Update game logic
    if (this.updateCallback) {
      this.updateCallback(deltaTime);
    }

    // Clear and render
    this.clear();
    if (this.renderCallback) {
      this.renderCallback();
    }

    // Continue loop
    requestAnimationFrame(this.loop);
  };

  /**
   * Get canvas dimensions
   */
  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Get canvas bounding rect for input calculations
   */
  getBoundingRect(): DOMRect {
    return this.canvas.getBoundingClientRect();
  }
}
