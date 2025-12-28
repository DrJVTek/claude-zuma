import { LevelConfig, createPath, generateSpiralPath } from '../core/Level.ts';
import { BallColor, CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/types.ts';

/**
 * Level 1: Introduction
 * A simple spiral path with 4 colors.
 * Slow ball speed for beginners.
 */

// Generate spiral path control points
const spiralPoints = generateSpiralPath(
  CANVAS_WIDTH / 2,   // Center X
  CANVAS_HEIGHT / 2,  // Center Y
  250,                // Start radius (outer)
  50,                 // End radius (inner, near hole)
  2.5,                // Number of turns
  6                   // Segments per turn
);

export const level1: LevelConfig = {
  id: 1,
  name: 'Temple Entrance',
  path: createPath('level1', spiralPoints),
  colors: [
    BallColor.RED,
    BallColor.BLUE,
    BallColor.GREEN,
    BallColor.YELLOW
  ],
  ballSpeed: 50,           // 50 pixels per second
  spawnRate: 0.8,          // New ball every 1.25 seconds
  spawnThreshold: 50,      // 50 balls total before spawning stops
  initialBallCount: 10     // Start with 10 balls
};
