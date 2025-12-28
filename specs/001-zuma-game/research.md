# Technical Research: Classic Zuma Game

**Date**: 2025-12-28
**Feature**: 001-zuma-game

## Research Areas

### 1. Rendering Technology

**Decision**: HTML5 Canvas 2D API

**Rationale**:
- Native browser support, no dependencies required
- Sufficient for 2D sprite-based games at 60fps
- Simple API for drawing circles, images, and transformations
- Well-documented with extensive community resources

**Alternatives Considered**:
- WebGL: Overkill for 2D game, adds complexity without benefit
- SVG: Poor performance for many moving objects, DOM manipulation overhead
- PixiJS: Adds dependency, Canvas is sufficient for this scope
- Phaser: Full game framework is overkill, we only need rendering

### 2. Path Representation

**Decision**: Parametric curve using Bezier splines with t-parameter (0 to 1)

**Rationale**:
- Bezier curves are mathematically well-defined and smooth
- Easy to calculate position at any point using t parameter
- Standard approach in game development for paths
- Can represent spiral/curved paths required by spec

**Implementation Approach**:
- Define path as array of control points
- Use cubic Bezier interpolation between segments
- Pre-calculate arc length table for uniform ball spacing
- Ball position = getPointAtDistance(distanceAlongPath)

**Alternatives Considered**:
- Discrete point array: Less smooth, harder to calculate intermediate positions
- Catmull-Rom splines: Slightly more complex, Bezier is sufficient
- Procedural spiral formula: Less flexible for varied level designs

### 3. Ball Chain Data Structure

**Decision**: Doubly-linked list with distance-based positioning

**Rationale**:
- Efficient insertion at any point (O(1) after finding position)
- Efficient removal of matched balls (O(1))
- Easy to traverse in both directions for gap closing
- Natural representation of chain connectivity

**Implementation Approach**:
- Each ball has: color, distanceAlongPath, prev, next pointers
- Chain maintains head and tail references
- Gap closing: back portion balls have negative velocity until gap closes

**Alternatives Considered**:
- Array: O(n) insertion/removal, requires shifting elements
- Single linked list: Can't efficiently traverse backwards for gap closing

### 4. Collision Detection

**Decision**: Distance-based collision with path projection

**Rationale**:
- Fired ball trajectory is a straight line from shooter
- Find intersection point with path curve
- Determine insertion point based on nearest balls in chain

**Implementation Approach**:
1. Ray-cast from shooter in aim direction
2. Find closest point on path to ray
3. Check if any ball in chain is within collision radius
4. Insert new ball before or after collided ball based on direction

**Alternatives Considered**:
- Pixel-perfect collision: Unnecessary precision, slower
- Bounding box: Not suitable for curved paths and circular balls

### 5. Match Detection Algorithm

**Decision**: Linear scan from insertion point

**Rationale**:
- Matches can only occur at insertion point
- Scan outward in both directions counting same-color balls
- Simple and efficient O(k) where k is match length

**Implementation Approach**:
```
insertBall(position, color):
  count = 1
  // Scan backward
  curr = position.prev
  while curr and curr.color == color:
    count++
    curr = curr.prev
  // Scan forward
  curr = position.next
  while curr and curr.color == color:
    count++
    curr = curr.next
  if count >= 3:
    removeMatchedBalls()
    triggerGapClose()
```

### 6. Gap Closing Mechanics

**Decision**: Velocity-based snap with chain reaction detection

**Rationale**:
- Back portion gets negative velocity (moves toward front)
- Front portion continues normal movement
- When gap closes, check for new matches (chain reaction)
- Feels satisfying and matches classic Zuma behavior

**Implementation Approach**:
- On match removal, mark split point
- Back portion velocity = -snapSpeed (e.g., -400 pixels/sec)
- On collision with front portion:
  - Merge chain segments
  - Check for new color matches
  - If match found, repeat removal process

### 7. Weighted Random Ball Selection

**Decision**: Probability distribution based on chain composition

**Rationale**:
- Count occurrences of each color in current chain
- Assign higher probability to colors with more balls
- Ensures player always has useful balls

**Implementation Approach**:
```
getNextBallColor():
  colorCounts = countColorsInChain()
  totalWeight = sum(colorCounts.values())
  random = Math.random() * totalWeight
  cumulative = 0
  for color, count in colorCounts:
    cumulative += count
    if random < cumulative:
      return color
```

### 8. Audio Implementation

**Decision**: Web Audio API with preloaded sound pool

**Rationale**:
- Low-latency playback essential for responsive feedback
- Can play multiple sounds simultaneously
- No external dependencies

**Implementation Approach**:
- Preload all sound effects on game start
- Create AudioContext once
- Use AudioBufferSourceNode for each sound play
- Sound pool for frequently-played sounds (shoot, match)

### 9. State Management

**Decision**: Simple state machine with central game state object

**Rationale**:
- Game has clear discrete states (menu, playing, paused, win, lose)
- No complex state transitions requiring a framework
- Central state object simplifies testing

**States**:
- MENU: Title screen, start button
- PLAYING: Active gameplay
- PAUSED: Overlay, resume/quit options
- WIN: Level complete, score display, next/replay
- LOSE: Game over, score display, retry

### 10. Build Tooling

**Decision**: Vite with TypeScript

**Rationale**:
- Fast development server with hot reload
- Native TypeScript support
- Simple configuration
- Efficient production builds
- Modern ESM support

**Alternatives Considered**:
- Webpack: More complex configuration
- Parcel: Less control over build
- esbuild direct: Missing dev server features
- No bundler: Would need manual module handling

## Performance Considerations

### Target: 60 FPS

**Strategies**:
1. **Game loop**: Use requestAnimationFrame, fixed timestep for physics
2. **Rendering**: Only redraw changed areas when possible (dirty rectangles)
3. **Object pooling**: Reuse ball objects instead of creating new ones
4. **Pre-calculation**: Cache path positions, avoid runtime trigonometry where possible

### Memory Management

- Limit particle effects (explosion debris)
- Clear audio buffers when level ends
- Reuse ball objects from pool

## Browser Compatibility

**Target**: Modern evergreen browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required APIs**:
- Canvas 2D Context
- Web Audio API
- localStorage
- requestAnimationFrame

No polyfills required for target browsers.
