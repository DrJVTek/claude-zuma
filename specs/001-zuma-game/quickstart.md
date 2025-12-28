# Developer Quickstart: Classic Zuma Game

**Date**: 2025-12-28
**Feature**: 001-zuma-game

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm 8+
- Modern browser (Chrome, Firefox, Safari, or Edge)

## Project Setup

### 1. Initialize Project

```bash
# From repository root
npm init -y
npm install -D typescript vite vitest @vitest/browser playwright
```

### 2. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vitest/globals"],
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules"]
}
```

### 3. Configure Vite

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  }
});
```

### 4. Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/core/**']
    }
  }
});
```

### 5. Add npm Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

## Development Workflow

### Start Development Server

```bash
npm run dev
```

Opens browser at `http://localhost:3000` with hot reload.

### Run Tests

```bash
# Watch mode
npm test

# Single run
npm run test:run

# E2E tests (requires build first)
npm run build && npm run test:e2e
```

### Build for Production

```bash
npm run build
```

Output in `dist/` folder.

## Project Structure Reference

```
src/
├── core/           # Game logic (test this!)
├── rendering/      # Canvas drawing
├── input/          # Mouse/keyboard
├── audio/          # Sound effects
├── state/          # Game state management
├── levels/         # Level definitions
├── main.ts         # Entry point
└── index.html      # HTML shell

tests/
├── unit/           # Core logic tests
└── e2e/            # Browser tests

assets/
├── images/         # Sprites
└── sounds/         # Audio files
```

## Key Implementation Order

1. **Path & Ball basics** - Get balls rendering on a path
2. **Chain movement** - Balls moving toward hole
3. **Shooter aiming** - Mouse tracking, rotation
4. **Ball firing** - Trajectory, collision detection
5. **Match detection** - 3+ same color removal
6. **Gap closing** - Snap-back mechanic
7. **Chain reactions** - Cascading matches
8. **Win/Lose conditions** - Game state transitions
9. **Scoring** - Points, multipliers
10. **Multiple levels** - Level progression
11. **Audio** - Sound effects
12. **Polish** - Animations, particles

## Testing Strategy

### Unit Tests (Priority)

Focus on `src/core/`:
- `Chain.test.ts` - Ball insertion, removal, traversal
- `Collision.test.ts` - Hit detection, insertion point
- `Score.test.ts` - Point calculations
- `Path.test.ts` - Position calculations

### E2E Tests

- Game start flow
- Basic match-3 completion
- Win/lose conditions
- Level progression

## Common Pitfalls

1. **Floating point errors** - Use tolerance when comparing positions
2. **Frame-rate independence** - Always multiply by deltaTime
3. **Event listener cleanup** - Remove on component destroy
4. **Audio context** - Must be created after user interaction

## Debugging Tips

### Visual Debugging

```typescript
// In PathRenderer, add debug mode
renderPath(path: IPath, ctx: CanvasRenderingContext2D, debug = false) {
  if (debug) {
    // Draw control points
    // Draw distance markers
  }
}
```

### State Inspection

```typescript
// Expose state globally in dev mode
if (import.meta.env.DEV) {
  (window as any).gameState = controller.getState();
}
```

### Performance Monitoring

```typescript
// Simple FPS counter
let lastTime = performance.now();
let frameCount = 0;

function gameLoop(time: number) {
  frameCount++;
  if (time - lastTime > 1000) {
    console.log('FPS:', frameCount);
    frameCount = 0;
    lastTime = time;
  }
  // ... game logic
  requestAnimationFrame(gameLoop);
}
```

## Asset Requirements

### Images (create or source)

| Asset | Size | Format |
|-------|------|--------|
| Ball sprites (5 colors) | 32x32 each | PNG with transparency |
| Shooter | 64x64 | PNG with transparency |
| Hole | 48x48 | PNG with transparency |
| Background | 800x600 | PNG or JPEG |

### Sounds (source royalty-free)

| Sound | Duration | Format |
|-------|----------|--------|
| shoot.wav | <0.2s | WAV/MP3 |
| match.wav | <0.5s | WAV/MP3 |
| chain.wav | <0.3s | WAV/MP3 |
| win.wav | <2s | WAV/MP3 |
| lose.wav | <2s | WAV/MP3 |

## Getting Help

- Review `specs/001-zuma-game/spec.md` for requirements
- Check `specs/001-zuma-game/data-model.md` for entity details
- Reference `specs/001-zuma-game/contracts/` for interfaces
