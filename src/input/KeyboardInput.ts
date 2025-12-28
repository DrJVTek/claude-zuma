/**
 * Handles keyboard input for the game.
 */
export class KeyboardInput {
  private keysDown: Set<string> = new Set();
  private keysPressed: Set<string> = new Set();

  constructor() {
    this.setupListeners();
  }

  /**
   * Set up keyboard event listeners
   */
  private setupListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (!this.keysDown.has(e.code)) {
        this.keysPressed.add(e.code);
      }
      this.keysDown.add(e.code);

      // Prevent default for game keys
      if (e.code === 'Space' || e.code === 'Escape') {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.code);
    });

    // Clear keys when window loses focus
    window.addEventListener('blur', () => {
      this.keysDown.clear();
      this.keysPressed.clear();
    });
  }

  /**
   * Check if swap key was pressed this frame (Space)
   */
  isSwapPressed(): boolean {
    return this.keysPressed.has('Space');
  }

  /**
   * Check if pause key was pressed this frame (Escape)
   */
  isPausePressed(): boolean {
    return this.keysPressed.has('Escape');
  }

  /**
   * Check if a key is currently held down
   */
  isKeyDown(code: string): boolean {
    return this.keysDown.has(code);
  }

  /**
   * Update - call at end of frame to clear pressed keys
   */
  update(): void {
    this.keysPressed.clear();
  }
}
