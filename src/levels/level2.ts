import { LevelConfig, createPath, generateSCurvePath } from '../core/Level.ts';
import { BallColor, CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/types.ts';

/**
 * Level 2: Serpent's Path
 * A winding S-curve path with faster ball speed.
 * Still 4 colors but faster and longer.
 */

// Generate S-curve path
const sCurvePoints = generateSCurvePath(
  CANVAS_WIDTH / 2,   // Start X (center)
  50,                 // Start Y (top)
  250,                // Width of curves
  CANVAS_HEIGHT - 100, // Total height
  3                   // Number of waves
);

export const level2: LevelConfig = {
  id: 2,
  name: "Serpent's Path",
  path: createPath('level2', sCurvePoints),
  colors: [
    BallColor.RED,
    BallColor.BLUE,
    BallColor.GREEN,
    BallColor.YELLOW
  ],
  ballSpeed: 70,           // 70 pixels per second (faster)
  spawnRate: 1.0,          // New ball every second
  spawnThreshold: 60,      // 60 balls total
  initialBallCount: 12     // Start with 12 balls
};
