import { LevelConfig } from '../core/Level.ts';
import { level1 } from './level1.ts';
import { level2 } from './level2.ts';
import { level3 } from './level3.ts';

/**
 * All available levels
 */
export const levels: LevelConfig[] = [level1, level2, level3];

/**
 * Total number of levels
 */
export const TOTAL_LEVELS = levels.length;

/**
 * Get a level by its ID (1-indexed)
 */
export function getLevel(id: number): LevelConfig | null {
  const level = levels.find(l => l.id === id);
  return level ?? null;
}

/**
 * Check if a level ID is the final level
 */
export function isFinalLevel(id: number): boolean {
  return id >= TOTAL_LEVELS;
}

// Re-export for convenience
export { level1, level2, level3 };
