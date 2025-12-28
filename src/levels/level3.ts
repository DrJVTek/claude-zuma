import { LevelConfig, createPath, generateSpiralPath } from '../core/Level.ts';
import { BallColor, CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/types.ts';

/**
 * Level 3: Dragon's Coil
 * A tight spiral with fast ball speed and all 5 colors.
 * The ultimate challenge!
 */

// Generate tighter spiral path
const tightSpiralPoints = generateSpiralPath(
  CANVAS_WIDTH / 2,   // Center X
  CANVAS_HEIGHT / 2,  // Center Y
  280,                // Start radius (larger outer)
  40,                 // End radius (tighter inner)
  3.5,                // More turns
  8                   // More segments for smoother curve
);

export const level3: LevelConfig = {
  id: 3,
  name: "Dragon's Coil",
  path: createPath('level3', tightSpiralPoints),
  colors: [
    BallColor.RED,
    BallColor.BLUE,
    BallColor.GREEN,
    BallColor.YELLOW,
    BallColor.PURPLE   // 5th color for added difficulty
  ],
  ballSpeed: 90,           // 90 pixels per second (fast!)
  spawnRate: 1.2,          // New ball every 0.83 seconds
  spawnThreshold: 75,      // 75 balls total
  initialBallCount: 15     // Start with 15 balls
};
