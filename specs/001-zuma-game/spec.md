# Feature Specification: Classic Zuma Game

**Feature Branch**: `001-zuma-game`
**Created**: 2025-12-28
**Status**: Draft
**Input**: User description: "fait moi un zuma game classique"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start and Play a Level (Priority: P1)

A player launches the game and starts playing a level. They see a spiral path with colored balls rolling along it toward a hole at the center. The player controls a frog-like shooter at the center that can rotate and fire colored balls. When three or more balls of the same color connect, they explode and are removed from the chain.

**Why this priority**: Core gameplay is essential - without the ability to shoot and match balls, there is no game.

**Independent Test**: Can be fully tested by launching a single level and verifying the player can shoot balls, create matches of 3+, and see balls explode. Delivers the fundamental Zuma experience.

**Acceptance Scenarios**:

1. **Given** the game is launched, **When** the player starts a new game, **Then** a level loads with a spiral path, a chain of colored balls, and a central shooter
2. **Given** a level is active, **When** the player aims and fires a ball, **Then** the ball travels in the aimed direction and inserts into the chain at the collision point
3. **Given** a ball is inserted into the chain, **When** 3 or more balls of the same color are adjacent, **Then** the matching balls explode and are removed from the chain
4. **Given** balls are removed from the chain, **When** the remaining balls on either side are the same color and touch, **Then** a chain reaction occurs and those balls also explode

---

### User Story 2 - Win or Lose a Level (Priority: P1)

The player can win a level by clearing all balls from the path, or lose if balls reach the end hole before being cleared.

**Why this priority**: Victory and defeat conditions define the game's challenge and give meaning to the gameplay.

**Independent Test**: Can be tested by playing until all balls are cleared (win) or until balls reach the hole (lose). Delivers clear win/lose feedback.

**Acceptance Scenarios**:

1. **Given** a level is in progress, **When** all balls in the chain are cleared, **Then** the player wins the level and receives a victory message
2. **Given** a level is in progress, **When** the first ball in the chain reaches the end hole, **Then** the player loses and receives a game over message
3. **Given** the player wins or loses, **When** the result is displayed, **Then** the player can choose to replay or exit

---

### User Story 3 - Score Tracking (Priority: P2)

The player earns points for each match made and for chain reactions. The score is displayed during gameplay.

**Why this priority**: Scoring adds replayability and player motivation, but the game is playable without it.

**Independent Test**: Can be tested by making matches and verifying points accumulate and display correctly.

**Acceptance Scenarios**:

1. **Given** the player matches 3+ balls, **When** the balls explode, **Then** points are awarded and the score updates
2. **Given** a chain reaction occurs, **When** additional balls explode, **Then** bonus points are awarded for each chain reaction
3. **Given** a level is completed, **When** the victory screen appears, **Then** the final score for that level is displayed

---

### User Story 4 - Ball Preview and Swap (Priority: P2)

The player can see what color ball they will shoot next and can swap between the current ball and a reserve ball.

**Why this priority**: Adds strategic depth but the core game functions without this feature.

**Independent Test**: Can be tested by verifying the next ball color is visible and swap functionality works.

**Acceptance Scenarios**:

1. **Given** the shooter has a ball loaded, **When** the player looks at the shooter, **Then** the current ball color and next ball color are visible
2. **Given** the shooter has a current and reserve ball, **When** the player presses the swap key/button, **Then** the current and reserve balls switch positions

---

### User Story 5 - Multiple Levels (Priority: P3)

The player can progress through multiple levels with increasing difficulty (faster ball speed, more colors, longer paths).

**Why this priority**: Multiple levels provide variety but a single-level game is still playable.

**Independent Test**: Can be tested by completing a level and verifying the next level loads with different/harder parameters.

**Acceptance Scenarios**:

1. **Given** the player completes a level, **When** they choose to continue, **Then** the next level loads with increased difficulty
2. **Given** a higher difficulty level, **When** gameplay begins, **Then** balls move faster and/or more colors are introduced

---

### Edge Cases

- What happens when the player shoots a ball but the chain is moving very fast? The ball still inserts at the collision point.
- How does the system handle rapid-fire shooting? Shots are queued or there is a minimum cooldown between shots.
- What happens if only 2 balls of the same color remain? They cannot match; the player must wait for new balls or use other colors strategically.
- What happens at the very end of the chain? Balls can still be inserted and matched normally.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a spiral or curved path along which balls travel
- **FR-002**: System MUST continuously spawn new balls at the path start until a spawn threshold is reached (e.g., total balls spawned or checkpoint hit), after which no new balls enter and the player must clear the remaining chain to win
- **FR-003**: System MUST display a central shooter that the player controls
- **FR-004**: System MUST allow the player to rotate the shooter 360 degrees using mouse/touch/keyboard input
- **FR-005**: System MUST fire a colored ball from the shooter when the player clicks/taps/presses the fire button
- **FR-006**: System MUST insert the fired ball into the chain at the point of collision
- **FR-007**: System MUST detect when 3 or more adjacent balls have the same color
- **FR-008**: System MUST remove matched balls from the chain with a visual explosion effect
- **FR-009**: System MUST trigger chain reactions when remaining balls reconnect and form new matches
- **FR-022**: System MUST reverse the back portion of the chain after a match, snapping it toward the front portion to close the gap
- **FR-010**: System MUST end the level in defeat when a ball reaches the end hole
- **FR-011**: System MUST end the level in victory when all balls are cleared
- **FR-012**: System MUST display the current score during gameplay
- **FR-013**: System MUST award points for matches (base points for 3 balls, increasing for more)
- **FR-014**: System MUST award bonus points for chain reactions
- **FR-015**: System MUST show the current ball color and next ball color in the shooter
- **FR-016**: System MUST allow the player to swap current and reserve balls
- **FR-017**: System MUST support at least 4 different ball colors
- **FR-021**: System MUST assign shooter ball colors using weighted randomization that favors colors currently present in the chain
- **FR-018**: System MUST pause the game when the player requests it
- **FR-019**: System MUST provide audio feedback for shooting, matching, and game events
- **FR-020**: System MUST include at least 3 distinct levels with increasing difficulty

### Key Entities

- **Ball**: Represents a colored sphere. Has a color, position on path, and visual state.
- **Chain**: The sequence of balls moving along the path. Maintains order and detects matches.
- **Path**: The curved/spiral trajectory balls follow. Defines start point, end point (hole), and shape.
- **Shooter**: The player-controlled entity at center. Has rotation angle, current ball, and reserve ball.
- **Level**: A game stage with specific path layout, ball colors used, speed, and win conditions.
- **Score**: The player's accumulated points for the current session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can complete a basic level within 5 minutes of starting their first game
- **SC-002**: Ball matching occurs within 0.5 seconds of collision detection (responsive feel)
- **SC-003**: Chain reactions are visually clear with distinct timing between each explosion
- **SC-004**: 90% of players can understand the controls without a tutorial
- **SC-005**: The game runs smoothly at 60 frames per second on standard hardware
- **SC-006**: Players can complete all 3 levels within 30 minutes of gameplay
- **SC-007**: Audio and visual feedback confirms every player action (shoot, match, win, lose)

## Clarifications

### Session 2025-12-28

- Q: How are new balls introduced during gameplay? → A: Continuous spawn at path start until a threshold is met, then chain must be cleared to win
- Q: How are shooter ball colors determined? → A: Weighted random favoring colors currently present in the chain
- Q: How does the gap close when balls are removed? → A: Back portion reverses and snaps toward the front portion to close the gap
- Q: Should the game include power-ups (slow-down, bomb, etc.)? → A: No power-ups for initial release; focus on core match-3 mechanics only

## Out of Scope (Initial Release)

- Power-ups and special ball types (slow-down, reverse, bomb, accuracy boost)
- Mobile/tablet-optimized layouts (desktop browser is primary target)
- Online leaderboards or multiplayer features
- Procedurally generated levels

## Assumptions

- The game will be developed for web browser (desktop) as the primary platform
- Mouse control is the primary input method (aim with mouse position, click to shoot)
- A simple title screen with "Start Game" is sufficient for initial release
- Ball colors are solid and distinct (e.g., red, blue, green, yellow, purple)
- Path designs are pre-defined, not procedurally generated
- Local high score storage is acceptable (no server-side leaderboards required)
- Sound effects can use simple, royalty-free audio
- Graphics can use simple 2D sprites or shapes (no complex 3D rendering required)
