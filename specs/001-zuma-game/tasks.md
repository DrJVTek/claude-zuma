# Tasks: Classic Zuma Game

**Input**: Design documents from `/specs/001-zuma-game/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No explicit test tasks included (not requested in specification). Tests can be added during implementation as needed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project Infrastructure)

**Purpose**: Project initialization, tooling, and basic structure

- [x] T001 Create project directory structure per plan.md (src/core, src/rendering, src/input, src/audio, src/state, src/levels, assets/, tests/)
- [x] T002 Initialize npm project with package.json and configure TypeScript 5.x in tsconfig.json
- [x] T003 [P] Configure Vite bundler in vite.config.ts with dev server on port 3000
- [x] T004 [P] Configure Vitest for unit testing in vitest.config.ts
- [x] T005 [P] Create src/index.html with canvas element (800x600) and basic styling
- [x] T006 [P] Create shared types and enums in src/core/types.ts (BallColor, BallState, GameStatus, Point, Vector)
- [x] T007 Create placeholder asset directories: assets/images/, assets/sounds/

---

## Phase 2: Foundational (Core Game Mechanics)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Implement Path class in src/core/Path.ts with Bezier curve interpolation, getPointAtDistance(), getTangentAtDistance()
- [x] T009 Implement Ball class in src/core/Ball.ts with id, color, distanceAlongPath, state, prev/next pointers
- [x] T010 Implement Chain class in src/core/Chain.ts with doubly-linked list operations: insertBall(), removeBall(), getBalls(), isEmpty()
- [x] T011 [P] Implement base Renderer class in src/rendering/Renderer.ts with canvas setup, clear(), and game loop using requestAnimationFrame
- [x] T012 [P] Implement MouseInput handler in src/input/MouseInput.ts with mouse position tracking and click detection
- [x] T013 Implement GameState container in src/state/GameState.ts with status, level, chain, shooter, score, firedBalls
- [x] T014 Implement StateManager in src/state/StateManager.ts with state transitions (MENU → PLAYING → PAUSED/WIN/LOSE)
- [x] T015 Create main.ts entry point with game initialization and loop startup

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Start and Play a Level (Priority: P1) 🎯 MVP

**Goal**: Player can launch the game, see a spiral path with balls, aim and fire the shooter, match 3+ balls to explode them, and trigger chain reactions.

**Independent Test**: Launch game, fire balls, create 3+ matches, verify explosions and chain reactions occur.

### Core Game Logic for US1

- [x] T016 [US1] Add chain movement logic to Chain.ts: update() method that advances all balls along path by velocity * deltaTime
- [x] T017 [US1] Implement Shooter class in src/core/Shooter.ts with position, rotation, currentBall, reserveBall, canFire(), fire(), aimAt()
- [x] T018 [US1] Implement collision detection in src/core/Collision.ts: checkBallChainCollision() to find insertion point when fired ball hits chain
- [x] T019 [US1] Implement match detection in src/core/Collision.ts: findMatch() that scans for 3+ adjacent same-color balls from insertion point
- [x] T020 [US1] Implement gap closing in Chain.ts: splitChain() and closeGap() with back portion snap-back velocity
- [x] T021 [US1] Implement chain reaction detection in src/core/Collision.ts: willCreateChainReaction() called after gap closes
- [x] T022 [US1] Implement ball spawner in src/core/BallSpawner.ts with weighted random color selection based on chain composition

### Level Configuration for US1

- [x] T023 [US1] Implement Level interface in src/core/Level.ts with path, colors, ballSpeed, spawnRate, spawnThreshold
- [x] T024 [US1] Create Level 1 definition in src/levels/level1.ts with spiral path control points, 4 colors, 50px/s speed

### Rendering for US1

- [x] T025 [P] [US1] Implement PathRenderer in src/rendering/PathRenderer.ts to draw the path curve and hole
- [x] T026 [P] [US1] Implement BallRenderer in src/rendering/BallRenderer.ts to draw colored circles for each ball in chain
- [x] T027 [P] [US1] Implement ShooterRenderer in src/rendering/ShooterRenderer.ts to draw shooter with rotation indicator
- [x] T028 [US1] Implement explosion Effects in src/rendering/Effects.ts with particle burst animation for matched balls
- [x] T029 [US1] Integrate all renderers in Renderer.ts render() method to draw complete game frame

### Game Loop Integration for US1

- [x] T030 [US1] Implement game update loop: process input → update shooter aim → update fired balls → update chain → check collisions → check matches
- [x] T031 [US1] Add ball spawning to game loop: spawn new balls at path start based on spawnRate until spawnThreshold reached
- [x] T032 [US1] Implement fired ball trajectory: move fired ball in straight line from shooter until collision or off-screen

### Input for US1

- [x] T033 [US1] Connect mouse position to shooter.aimAt() for 360° rotation
- [x] T034 [US1] Connect mouse click to shooter.fire() with cooldown enforcement

**Checkpoint**: Core gameplay loop complete - player can shoot, match, and chain react. Ready for independent testing.

---

## Phase 4: User Story 2 - Win or Lose a Level (Priority: P1)

**Goal**: Player wins by clearing all balls after spawn threshold, loses if any ball reaches the hole.

**Independent Test**: Play until chain is empty (win) or ball reaches hole (lose), verify appropriate screen appears with replay option.

### Win/Lose Logic for US2

- [x] T035 [US2] Implement hole collision detection in src/core/Collision.ts: checkHoleCollision() returns true when head ball distance <= 0
- [x] T036 [US2] Implement win condition check in game loop: if chain.isEmpty() AND ballsSpawned >= spawnThreshold, trigger WIN state
- [x] T037 [US2] Implement lose condition check in game loop: if checkHoleCollision() returns true, trigger LOSE state

### UI Screens for US2

- [x] T038 [P] [US2] Implement UIRenderer in src/rendering/UIRenderer.ts with renderMenu(), renderWin(), renderLose() methods
- [x] T039 [US2] Create menu screen in UIRenderer: title text, "Start Game" button area
- [x] T040 [US2] Create win screen in UIRenderer: "Level Complete!" text, replay/continue button areas
- [x] T041 [US2] Create lose screen in UIRenderer: "Game Over" text, retry/quit button areas

### State Transitions for US2

- [x] T042 [US2] Handle menu click to start game: transition MENU → PLAYING, initialize level
- [x] T043 [US2] Handle win screen actions: "Replay" restarts current level, "Continue" advances to next (if not level 3)
- [x] T044 [US2] Handle lose screen actions: "Retry" restarts current level, "Quit" returns to MENU

**Checkpoint**: Complete game loop with win/lose conditions. Game is now fully playable as MVP.

---

## Phase 5: User Story 3 - Score Tracking (Priority: P2)

**Goal**: Player earns points for matches and chain reactions, score displays during gameplay and on victory screen.

**Independent Test**: Make matches and verify score increments correctly, check chain reaction bonus, verify final score on win screen.

### Score Logic for US3

- [x] T045 [US3] Implement Score class in src/core/Score.ts with current, total, chainMultiplier, highScore properties
- [x] T046 [US3] Implement addMatchPoints() in Score.ts: 100 for 3 balls, 150 for 4, 200+50*extra for 5+
- [x] T047 [US3] Implement chain reaction multiplier: increment chainMultiplier on each chain reaction, reset after no match
- [x] T048 [US3] Add localStorage persistence for highScore in Score.ts: saveHighScore(), loadHighScore()

### Score Display for US3

- [x] T049 [US3] Add renderScore() to UIRenderer: display current score in top-left during gameplay
- [x] T050 [US3] Update win screen to display final level score and total score
- [x] T051 [US3] Display high score on menu screen

### Integration for US3

- [x] T052 [US3] Connect match events to score.addMatchPoints() in game loop
- [x] T053 [US3] Reset level score on level start, accumulate to total on level complete

**Checkpoint**: Score tracking complete. Player motivation enhanced with visible progress.

---

## Phase 6: User Story 4 - Ball Preview and Swap (Priority: P2)

**Goal**: Player can see current and reserve ball colors, swap them using right-click or spacebar.

**Independent Test**: Verify both ball colors visible on shooter, swap triggers color exchange, fire uses correct color.

### Swap Logic for US4

- [x] T054 [US4] Add swap() method to Shooter.ts: exchange currentBall and reserveBall colors
- [x] T055 [US4] Update Shooter.fire() to use currentBall color, shift reserveBall to current, generate new reserve

### Input for US4

- [x] T056 [P] [US4] Implement KeyboardInput in src/input/KeyboardInput.ts with isSwapPressed() (Space key), isPausePressed() (Escape key)
- [x] T057 [US4] Add right-click and spacebar handlers to trigger shooter.swap()

### Rendering for US4

- [x] T058 [US4] Update ShooterRenderer to display both currentBall and reserveBall (smaller indicator for reserve)

### Pause Feature (bonus from FR-018)

- [x] T059 [US4] Implement pause overlay in UIRenderer.renderPause() with "Resume" and "Quit" options
- [x] T060 [US4] Handle Escape key to toggle PLAYING ↔ PAUSED state

**Checkpoint**: Strategic depth added with ball swap. Pause feature also complete.

---

## Phase 7: User Story 5 - Multiple Levels (Priority: P3)

**Goal**: Player progresses through 3 levels with increasing difficulty (speed, colors).

**Independent Test**: Complete level 1, verify level 2 loads with faster speed, complete all 3 levels.

### Level Definitions for US5

- [x] T061 [P] [US5] Create Level 2 definition in src/levels/level2.ts with different path shape, 70px/s speed, 4 colors
- [x] T062 [P] [US5] Create Level 3 definition in src/levels/level3.ts with complex path, 90px/s speed, 5 colors
- [x] T063 [US5] Create level loader in src/levels/index.ts that exports all levels and getLevel(id) function

### Level Progression for US5

- [x] T064 [US5] Update StateManager to track currentLevel (1-3)
- [x] T065 [US5] Implement level advancement: on WIN state, increment currentLevel if < 3
- [x] T066 [US5] Update win screen: show "Next Level" button if currentLevel < 3, "Game Complete!" if level 3

### Game Completion for US5

- [x] T067 [US5] Create game complete screen: show total score, high score, "Play Again" button
- [x] T068 [US5] Persist levelsCompleted and lastPlayed to localStorage

**Checkpoint**: Full 3-level game complete. All user stories implemented.

---

## Phase 8: Audio & Polish

**Purpose**: Audio feedback and final polish across all features

### Audio Implementation

- [x] T069 [P] Implement AudioManager in src/audio/AudioManager.ts with play(), setVolume(), setMuted(), preload()
- [x] T070 [P] Add placeholder sound files to assets/sounds/: shoot.mp3, match.mp3, chain.mp3, win.mp3, lose.mp3, swap.mp3
- [x] T071 Connect audio triggers: play shoot sound on fire, match sound on explosion, chain sound on chain reaction
- [x] T072 Connect audio triggers: play win sound on WIN state, lose sound on LOSE state, swap sound on ball swap

### Visual Polish

- [x] T073 [P] Add simple ball sprites to assets/images/ or use colored circles with gradient/shadow
- [x] T074 [P] Add background image to assets/images/background.png or use gradient fill
- [x] T075 Improve explosion effects with particle fade-out and expansion

### Performance & Edge Cases

- [x] T076 Implement object pooling for balls to reduce garbage collection
- [x] T077 Add shooter cooldown (e.g., 200ms) to prevent rapid-fire issues
- [x] T078 Handle edge case: ball insertion at chain endpoints

### Final Validation

- [x] T079 Verify 60fps performance in Chrome, Firefox, Safari, Edge
- [x] T080 Run through quickstart.md setup steps to validate developer experience
- [x] T081 Playtest all 3 levels end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Core gameplay
- **User Story 2 (Phase 4)**: Depends on Foundational - Can parallel with US1 but benefits from US1 core
- **User Story 3-5 (Phase 5-7)**: Depend on Foundational - Can parallel with each other
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Play Level) | Foundational only | - |
| US2 (Win/Lose) | Foundational only | US1 (but uses US1 components) |
| US3 (Score) | Foundational only | US1, US2, US4, US5 |
| US4 (Swap) | Foundational only | US1, US2, US3, US5 |
| US5 (Levels) | Foundational only | US1, US2, US3, US4 |

### Recommended Execution Order (Single Developer)

1. Phase 1: Setup (T001-T007)
2. Phase 2: Foundational (T008-T015)
3. Phase 3: User Story 1 - MVP gameplay (T016-T034)
4. Phase 4: User Story 2 - Win/Lose (T035-T044)
5. **CHECKPOINT: Playable MVP**
6. Phase 5: User Story 3 - Score (T045-T053)
7. Phase 6: User Story 4 - Swap (T054-T060)
8. Phase 7: User Story 5 - Levels (T061-T068)
9. Phase 8: Audio & Polish (T069-T081)

---

## Parallel Opportunities

### Phase 1 (Setup) - 3 parallel tasks
```
T003, T004, T005, T006 can all run in parallel
```

### Phase 2 (Foundational) - 2 parallel tasks
```
T011, T012 can run in parallel (different files)
```

### Phase 3 (US1) - 3 parallel rendering tasks
```
T025, T026, T027 can all run in parallel (different renderer files)
```

### Phase 6-7 (US4, US5) - Cross-story parallel
```
T056 (KeyboardInput) and T061, T062 (Level 2, 3) can run in parallel
```

### Phase 8 (Polish) - 4 parallel tasks
```
T069, T070, T073, T074 can all run in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup (7 tasks)
2. Complete Phase 2: Foundational (8 tasks)
3. Complete Phase 3: User Story 1 (19 tasks)
4. Complete Phase 4: User Story 2 (10 tasks)
5. **STOP and VALIDATE**: Game is fully playable with win/lose
6. Deploy/demo if ready

**MVP Task Count**: 44 tasks

### Incremental Delivery

| Increment | User Stories | Added Value |
|-----------|--------------|-------------|
| MVP | US1 + US2 | Playable game with win/lose |
| +Score | US3 | Player motivation, high scores |
| +Strategy | US4 | Swap adds strategic depth |
| +Content | US5 | 3 levels of increasing challenge |
| +Polish | Audio, effects | Professional feel |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total: 81 tasks across 8 phases
