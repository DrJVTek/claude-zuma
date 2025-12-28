import { Point } from '../core/types.ts';

/**
 * Handles mouse input for aiming and shooting.
 */
export class MouseInput {
  private canvas: HTMLCanvasElement;
  private mousePosition: Point = { x: 0, y: 0 };
  private leftClickPressed: boolean = false;
  private rightClickPressed: boolean = false;
  private leftClickConsumed: boolean = false;
  private rightClickConsumed: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  /**
   * Set up mouse event listeners on the canvas
   */
  private setupEventListeners(): void {
    // Track mouse position
    this.canvas.addEventListener('mousemove', this.handleMouseMove);

    // Track mouse clicks
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);

    // Prevent context menu on right-click
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Handle mouse leaving canvas
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
  }

  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  private handleMouseDown = (e: MouseEvent): void => {
    if (e.button === 0) {
      this.leftClickPressed = true;
      this.leftClickConsumed = false;
    } else if (e.button === 2) {
      this.rightClickPressed = true;
      this.rightClickConsumed = false;
    }
  };

  private handleMouseUp = (e: MouseEvent): void => {
    if (e.button === 0) {
      this.leftClickPressed = false;
    } else if (e.button === 2) {
      this.rightClickPressed = false;
    }
  };

  private handleMouseLeave = (): void => {
    this.leftClickPressed = false;
    this.rightClickPressed = false;
  };

  /**
   * Get current mouse position relative to canvas
   */
  getMousePosition(): Point {
    return { ...this.mousePosition };
  }

  /**
   * Check if left mouse button was just pressed (fire button)
   * Returns true only once per click
   */
  isFirePressed(): boolean {
    if (this.leftClickPressed && !this.leftClickConsumed) {
      this.leftClickConsumed = true;
      return true;
    }
    return false;
  }

  /**
   * Check if right mouse button was just pressed (swap button)
   * Returns true only once per click
   */
  isSwapPressed(): boolean {
    if (this.rightClickPressed && !this.rightClickConsumed) {
      this.rightClickConsumed = true;
      return true;
    }
    return false;
  }

  /**
   * Check if left mouse button is currently held down
   */
  isFireHeld(): boolean {
    return this.leftClickPressed;
  }

  /**
   * Update input state (call once per frame)
   * Resets single-press detection
   */
  update(): void {
    // Reset consumed state if button was released
    if (!this.leftClickPressed) {
      this.leftClickConsumed = false;
    }
    if (!this.rightClickPressed) {
      this.rightClickConsumed = false;
    }
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
  }
}
