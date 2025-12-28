# Implementation Plan: Classic Zuma Game

**Branch**: `001-zuma-game` | **Date**: 2025-12-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-zuma-game/spec.md`

## Summary

Implement a classic Zuma-style puzzle game for web browsers. Players control a central shooter that fires colored balls into a moving chain. Matching 3+ same-colored balls causes them to explode. The back portion of the chain snaps back to close gaps, enabling chain reactions. Win by clearing all balls before they reach the end hole. Features include score tracking, ball swap mechanic, and 3 levels with increasing difficulty.

## Technical Context

**Language/Version**: TypeScript 5.x with HTML5 Canvas API
**Primary Dependencies**: None required (vanilla TypeScript + Canvas); optional: Vite for bundling
**Storage**: localStorage for high scores and game progress
**Testing**: Vitest for unit tests, Playwright for E2E browser tests
**Target Platform**: Modern desktop browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single web application
**Performance Goals**: 60 fps rendering, <0.5s match detection response
**Constraints**: No external runtime dependencies, offline-capable after initial load
**Scale/Scope**: Single-player game, 3 levels, ~5 screens (title, gameplay, pause, win, lose)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: No project constitution defined (template placeholders only in `.specify/memory/constitution.md`)

No specific gates to enforce. Proceeding with standard best practices:
- Simple architecture (no over-engineering)
- Tests for core game logic
- Clean separation of concerns (rendering, game state, input handling)

## Project Structure

### Documentation (this feature)

```text
specs/001-zuma-game/
├── plan.md              # This file
├── research.md          # Phase 0: Technical research
├── data-model.md        # Phase 1: Game entities and state
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: Interface definitions
└── tasks.md             # Phase 2: Implementation tasks
```

### Source Code (repository root)

```text
src/
├── core/                # Game logic (pure functions, no rendering)
│   ├── Ball.ts          # Ball entity and color management
│   ├── Chain.ts         # Ball chain, movement, gap closing
│   ├── Path.ts          # Path definition and position calculations
│   ├── Shooter.ts       # Shooter rotation, ball queue, swap
│   ├── Collision.ts     # Ball insertion, match detection
│   ├── Score.ts         # Scoring rules and calculations
│   └── Level.ts         # Level configuration and progression
├── rendering/           # Canvas rendering layer
│   ├── Renderer.ts      # Main render loop and canvas setup
│   ├── BallRenderer.ts  # Ball sprites and animations
│   ├── PathRenderer.ts  # Path visualization
│   ├── UIRenderer.ts    # Score, screens, overlays
│   └── Effects.ts       # Explosions, particles
├── input/               # Input handling
│   ├── MouseInput.ts    # Mouse position and click events
│   └── KeyboardInput.ts # Pause, swap hotkeys
├── audio/               # Sound management
│   └── AudioManager.ts  # Sound effects playback
├── state/               # Game state management
│   ├── GameState.ts     # Central game state
│   └── StateManager.ts  # State transitions (menu, play, pause, end)
├── levels/              # Level definitions
│   ├── level1.ts        # Level 1 path and config
│   ├── level2.ts        # Level 2 path and config
│   └── level3.ts        # Level 3 path and config
├── main.ts              # Entry point, game initialization
└── index.html           # HTML shell with canvas

assets/
├── images/              # Ball sprites, shooter, backgrounds
└── sounds/              # Sound effects (shoot, match, win, lose)

tests/
├── unit/                # Unit tests for core logic
│   ├── Chain.test.ts
│   ├── Collision.test.ts
│   └── Score.test.ts
└── e2e/                 # End-to-end browser tests
    └── gameplay.test.ts
```

**Structure Decision**: Single web application structure optimized for a browser game. Core game logic is separated from rendering to enable unit testing without a browser environment. Levels are defined as data files for easy modification.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. Architecture is intentionally simple:
- No framework dependencies (vanilla TypeScript + Canvas)
- No state management library (simple state object)
- No build complexity beyond TypeScript compilation
