# Data Model: Classic Zuma Game

**Date**: 2025-12-28
**Feature**: 001-zuma-game

## Entities

### Ball

Represents a colored sphere in the game.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | string | Unique identifier | UUID format |
| color | BallColor | Ball color enum | One of: RED, BLUE, GREEN, YELLOW, PURPLE |
| distanceAlongPath | number | Position on path (0 to pathLength) | >= 0 |
| state | BallState | Current visual state | NORMAL, EXPLODING, INSERTED |
| prev | Ball \| null | Previous ball in chain | Linked list pointer |
| next | Ball \| null | Next ball in chain | Linked list pointer |

**State Transitions**:
```
NORMAL → INSERTED (when fired ball joins chain)
NORMAL → EXPLODING (when part of 3+ match)
INSERTED → NORMAL (after insertion animation)
EXPLODING → [removed] (after explosion animation)
```

### Chain

The sequence of balls moving along the path.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| head | Ball \| null | First ball (closest to hole) | - |
| tail | Ball \| null | Last ball (spawn point) | - |
| velocity | number | Movement speed (pixels/sec) | Positive = toward hole |
| splitPoint | number \| null | Distance where gap exists | null when no gap |
| backVelocity | number | Back portion velocity during snap | Negative during snap-back |

**Validation Rules**:
- If head is null, tail must be null (empty chain)
- All balls must have distanceAlongPath in ascending order from head to tail
- No two balls can have the same distanceAlongPath

### Path

The curved trajectory balls follow.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | string | Path identifier | Unique per level |
| controlPoints | Point[] | Bezier curve control points | Minimum 4 points |
| totalLength | number | Total path length in pixels | > 0 |
| holePosition | Point | End point (defeat trigger) | On path at distance 0 |
| spawnPosition | Point | Start point (ball spawn) | On path at totalLength |

**Derived Properties**:
- getPointAtDistance(d: number): Point - Calculate x,y at distance
- getTangentAtDistance(d: number): Vector - Direction at distance

### Shooter

The player-controlled entity.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| position | Point | Center position (fixed) | Center of play area |
| rotation | number | Aim angle in radians | 0 to 2π |
| currentBall | BallColor | Ball ready to fire | Valid color |
| reserveBall | BallColor | Swap ball | Valid color |
| cooldown | number | Time until next shot allowed (ms) | >= 0 |

**Validation Rules**:
- cooldown must be 0 before firing
- currentBall and reserveBall must be different (recommended, not enforced)

### Level

A game stage configuration.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | number | Level number | 1, 2, or 3 |
| name | string | Display name | Non-empty |
| path | Path | Level's path definition | Valid Path |
| colors | BallColor[] | Available colors | 4-5 colors |
| ballSpeed | number | Chain movement speed | > 0 |
| spawnRate | number | Balls spawned per second | > 0 |
| spawnThreshold | number | Total balls to spawn before stopping | > 0 |
| initialBallCount | number | Balls in chain at level start | > 0 |

**Difficulty Progression**:
| Level | Speed | Colors | Spawn Threshold |
|-------|-------|--------|-----------------|
| 1 | 50 px/s | 4 | 50 balls |
| 2 | 70 px/s | 4 | 70 balls |
| 3 | 90 px/s | 5 | 90 balls |

### Score

Player's accumulated points.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| current | number | Points in current level | >= 0 |
| total | number | Total across all levels | >= 0 |
| chainMultiplier | number | Current chain reaction bonus | >= 1 |
| highScore | number | Best total score (persisted) | >= 0 |

**Scoring Rules**:
| Event | Points |
|-------|--------|
| Match 3 balls | 100 |
| Match 4 balls | 150 |
| Match 5+ balls | 200 + 50 per extra |
| Chain reaction | Previous points × chainMultiplier |

### GameState

Central game state container.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| status | GameStatus | Current game phase | MENU, PLAYING, PAUSED, WIN, LOSE |
| currentLevel | number | Active level number | 1-3 |
| level | Level | Level configuration | Loaded from levels/ |
| chain | Chain | Ball chain state | - |
| shooter | Shooter | Shooter state | - |
| score | Score | Score state | - |
| ballsSpawned | number | Balls spawned this level | 0 to spawnThreshold |
| firedBalls | Ball[] | Balls in flight | Max 1 typically |
| timeElapsed | number | Time since level start (ms) | >= 0 |

**State Transitions**:
```
MENU → PLAYING (start game)
PLAYING → PAUSED (pause requested)
PAUSED → PLAYING (resume)
PAUSED → MENU (quit to menu)
PLAYING → WIN (all balls cleared after spawn complete)
PLAYING → LOSE (ball reaches hole)
WIN → PLAYING (next level) | MENU (level 3 complete)
LOSE → PLAYING (retry) | MENU (quit)
```

## Enums

### BallColor

```typescript
enum BallColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple'
}
```

### BallState

```typescript
enum BallState {
  NORMAL = 'normal',
  INSERTED = 'inserted',
  EXPLODING = 'exploding'
}
```

### GameStatus

```typescript
enum GameStatus {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  WIN = 'win',
  LOSE = 'lose'
}
```

## Value Objects

### Point

```typescript
interface Point {
  x: number;
  y: number;
}
```

### Vector

```typescript
interface Vector {
  x: number;
  y: number;
}
```

## Persistence

### LocalStorage Schema

**Key**: `zuma_high_scores`
**Value**: JSON object

```typescript
interface PersistedData {
  highScore: number;
  levelsCompleted: number;
  lastPlayed: string; // ISO date
}
```

## Relationships

```
Level 1──────1 Path
Level 1──────* BallColor (available colors)

GameState 1──────1 Level (current)
GameState 1──────1 Chain
GameState 1──────1 Shooter
GameState 1──────1 Score
GameState 1──────* Ball (firedBalls)

Chain 1──────* Ball (linked list)
Ball *──────1 BallColor

Shooter ──────2 BallColor (current + reserve)
```
