/**
 * Core types and enums for the Zuma game
 */

// Ball colors available in the game
export enum BallColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple'
}

// Visual state of a ball
export enum BallState {
  NORMAL = 'normal',
  INSERTED = 'inserted',
  EXPLODING = 'exploding'
}

// Game status for state management
export enum GameStatus {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  WIN = 'win',
  LOSE = 'lose'
}

// 2D point coordinate
export interface Point {
  x: number;
  y: number;
}

// 2D vector for direction/velocity
export interface Vector {
  x: number;
  y: number;
}

// Ball radius constant
export const BALL_RADIUS = 16;

// Default shooter cooldown in milliseconds
export const SHOOTER_COOLDOWN = 200;

// Fired ball speed in pixels per second
export const FIRED_BALL_SPEED = 800;

// Gap closing snap-back speed in pixels per second
export const SNAP_BACK_SPEED = 400;

// Canvas dimensions
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Helper function to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Helper to calculate distance between two points
export function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Helper to normalize a vector
export function normalize(v: Vector): Vector {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

// Helper to get angle from a vector
export function vectorToAngle(v: Vector): number {
  return Math.atan2(v.y, v.x);
}

// Helper to get vector from an angle
export function angleToVector(angle: number): Vector {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}
