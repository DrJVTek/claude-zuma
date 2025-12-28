# Zuma Clone

A classic Zuma-style puzzle game built with TypeScript and HTML5 Canvas.

## Features

- 3 unique levels with increasing difficulty
- Smooth Bezier curve paths for ball movement
- Match 3+ same-color balls to destroy them
- Chain reactions with score multipliers
- Ball swap mechanic (right-click or spacebar)
- High score persistence
- Synthetic audio feedback

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/DrJVTek/claude-zuma.git
cd claude-zuma

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at http://localhost:3000

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## How to Play

1. **Aim**: Move your mouse to aim the shooter
2. **Fire**: Left-click to shoot a ball
3. **Swap**: Right-click or press Spacebar to swap current and reserve balls
4. **Pause**: Press Escape to pause the game

### Objective

- Match 3 or more balls of the same color to destroy them
- Clear all balls before they reach the hole
- Create chain reactions for bonus points!

### Scoring

- 3 balls: 100 points
- 4 balls: 150 points
- 5+ balls: 200 + 50 per extra ball
- Chain reactions multiply your score!

## Levels

1. **Temple Entrance** - Spiral path, 4 colors, slow speed
2. **Serpent's Path** - S-curve path, 4 colors, medium speed
3. **Dragon's Coil** - Tight spiral, 5 colors, fast speed

## Tech Stack

- TypeScript 5.x
- HTML5 Canvas
- Vite (bundler)
- Vitest (testing)

## Project Structure

```
claude-zuma/
├── src/
│   ├── core/           # Game logic (Ball, Chain, Path, Collision)
│   ├── rendering/      # Canvas rendering (Renderer, Effects)
│   ├── input/          # Input handling (Mouse, Keyboard)
│   ├── state/          # Game state management
│   ├── levels/         # Level definitions
│   ├── audio/          # Audio manager
│   └── main.ts         # Entry point
├── assets/
│   ├── images/
│   └── sounds/
├── specs/              # Design documents
└── dist/               # Production build
```

## License

MIT
