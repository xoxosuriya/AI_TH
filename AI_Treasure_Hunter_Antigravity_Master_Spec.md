# AI Treasure Hunter — Antigravity Master Development Specification

## 0. Project identity

Project title: **AI Treasure Hunter: A Competitive Multi-Agent Game with Human-AI Interaction**

Course context: Design of Artificial Intelligence Products (21AIC402T), Unit 3 — AI in Gaming.

Goal: Build a polished, playable 2D top-down browser game in which a human player competes against autonomous AI treasure hunters. The AI must visibly use target selection, A* pathfinding, steering behaviours, state-based decision making, and dynamic replanning. The game must have multiple difficulty levels and multiple game levels.

The game should be easy to run locally, visually attractive enough for a college demonstration, and technically transparent enough that the AI behaviour can be explained during a viva.

## 1. Non-negotiable requirements

1. Use the provided **Screaming Brain Studios Top Down Dungeon Pack** as the primary environment art.
2. The supplied archive contains 64x64 floor and wall PNG assets, Tiled TSX definitions, and an `Example Map.tmx`. Do not assume that player, enemy, or treasure sprites are included in the archive.
3. If player/AI/treasure artwork is not included, create simple clean game-ready SVG/vector/canvas visuals or use CSS/canvas shapes. Do not block development waiting for additional art.
4. Build a **top-down orthographic** game, not isometric.
5. Browser game; desktop keyboard controls are the primary input.
6. Use **HTML5 Canvas + CSS + vanilla JavaScript modules** unless there is a strong technical reason to use a lightweight library. Avoid unnecessary frameworks.
7. No backend, database, login, API, or cloud dependency is required.
8. The game must work fully offline after the project files are installed.
9. The game must have:
   - Start/menu screen
   - Difficulty selection
   - Level selection/unlock progression
   - Tutorial/help screen
   - Gameplay HUD
   - Pause screen
   - Result/victory/defeat screen
   - Restart and main-menu controls
   - Multiple game levels
   - Multiple difficulty levels
   - Human player
   - At least 2 AI agents in normal play, configurable by difficulty
   - Treasures of different values
   - Obstacles/walls
   - Timer
   - Scoreboard
   - Exit/goal area
   - A* pathfinding
   - Utility-based target selection
   - Steering behaviours: Seek, Avoid, Arrive
   - Finite State Machine for AI state
   - Dynamic replanning
   - AI-vs-human competition
   - AI debug/visualization mode
10. Do not fake the AI with predefined movement paths. AI decisions must be computed at runtime from the current game state.

## 2. Game concept

Create a competitive dungeon treasure hunt.

The human player and autonomous AI agents enter a dungeon-like map containing walls and treasures. Every treasure has a value. Players/agents move around obstacles and attempt to collect the highest-value/most strategically useful treasures before time runs out. Treasures are shared world resources: once one competitor collects a treasure, it disappears for everybody else.

A level is won by meeting its objective and reaching the exit before the timer expires. If the player does not meet the objective, the level is lost. The end screen compares the human score with every AI score.

Core AI loop:

**Perceive -> Evaluate -> Decide -> Plan -> Navigate -> Act -> Re-evaluate**

## 3. Recommended technical approach

Use one Canvas for the game world and normal HTML/CSS for menus and HUD. Keep game coordinates separate from screen coordinates.

Recommended tile size: **64 px**, matching the supplied environment tiles.

Recommended logical grid: 20 columns x 12 rows for the first playable map, with later maps allowed to vary between approximately 18x10 and 26x15 depending on screen size and level complexity.

Recommended game world dimensions should not exceed what can comfortably fit in the browser viewport at normal scaling. Implement camera scaling/fit if a map is larger.

Use a fixed simulation timestep or a robust delta-time game loop. Rendering may use `requestAnimationFrame`.

Do not put the entire game in one HTML file. Use modules.

## 4. Folder structure

Create this structure:

```text
ai-treasure-hunter/
├── index.html
├── README.md
├── assets/
│   ├── tiles/
│   │   ├── floors/
│   │   └── walls/
│   ├── ui/
│   └── generated/
├── src/
│   ├── main.js
│   ├── config.js
│   ├── game/
│   │   ├── Game.js
│   │   ├── GameState.js
│   │   ├── GameLoop.js
│   │   └── Camera.js
│   ├── entities/
│   │   ├── Entity.js
│   │   ├── Player.js
│   │   ├── AIAgent.js
│   │   ├── Treasure.js
│   │   └── Exit.js
│   ├── ai/
│   │   ├── AIController.js
│   │   ├── Perception.js
│   │   ├── UtilityTargetSelector.js
│   │   ├── AStar.js
│   │   ├── PriorityQueue.js
│   │   ├── Steering.js
│   │   ├── StateMachine.js
│   │   └── CompetitionModel.js
│   ├── maps/
│   │   ├── MapManager.js
│   │   ├── MapParser.js
│   │   └── levels.js
│   ├── systems/
│   │   ├── CollisionSystem.js
│   │   ├── TreasureSystem.js
│   │   ├── ScoreSystem.js
│   │   ├── DifficultySystem.js
│   │   └── LevelProgression.js
│   ├── ui/
│   │   ├── MenuUI.js
│   │   ├── HUD.js
│   │   ├── TutorialUI.js
│   │   ├── ResultUI.js
│   │   └── DebugPanel.js
│   ├── rendering/
│   │   ├── Renderer.js
│   │   ├── AssetLoader.js
│   │   └── Effects.js
│   └── utils/
│       ├── math.js
│       ├── input.js
│       └── storage.js
└── tests/
    ├── astar.test.js
    ├── utility.test.js
    ├── collision.test.js
    └── level.test.js
```

Keep modules small and single-purpose.

## 5. Asset setup

At project initialization:

1. Locate the downloaded Top Down Dungeon Pack archive in the workspace.
2. Extract it into a temporary directory.
3. Copy only required PNG assets into the project `assets/tiles/` folders so the final project does not depend on a compressed archive being present at runtime.
4. Prefer the newer numbered variants where useful, for example:
   - Floor-Stone_01-64x64.png through Floor-Stone_04-64x64.png
   - Floor-Sand_01-64x64.png through Floor-Sand_04-64x64.png
   - Floor-Dirt_01-64x64.png through Floor-Dirt_04-64x64.png
   - Floor-Grass_01-64x64.png through Floor-Grass_02-64x64.png
   - Floor-Metal_01-64x64.png through Floor-Metal_02-64x64.png
   - Floor-Glass_01-64x64.png through Floor-Glass_02-64x64.png
   - Floor-Wood_01-64x64.png through Floor-Wood_02-64x64.png
   - Wall-Brick_01-64x64.png through Wall-Brick_04-64x64.png
   - Wall-Stone_01-64x64.png through Wall-Stone_04-64x64.png
   - Wall-Metal_01-64x64.png through Wall-Metal_04-64x64.png
   - Wall-Concrete_01-64x64.png through Wall-Concrete_04-64x64.png
   - and other available wall styles as appropriate.
5. Load images asynchronously and provide loading feedback.
6. If an asset fails to load, use a visible fallback tile so the game does not crash.
7. Use the included `Example Map.tmx` as a visual/layout reference where useful, but the primary game maps should be defined in project data so the AI grid is deterministic and easy to inspect.

Important: keep environment art and collision logic separate. A decorative floor tile is walkable unless the map data marks that cell as blocked. Walls/obstacles must be represented explicitly in the grid.

## 6. Map representation

Represent every level as a grid.

Use:
- `0` = walkable cell
- `1` = wall/obstacle
- `2` = player spawn
- `3` = AI spawn
- `4` = treasure spawn
- `5` = exit

For richer data, also maintain a separate `floorStyle` grid and treasure definition array.

Example:

```js
const level1 = {
  id: 1,
  name: 'Ruins Entrance',
  floor: 'stone',
  wall: 'brick',
  grid: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,1,0,0,0,0,0,1,0,0,4,0,1],
    [1,0,0,1,1,0,1,0,1,1,1,0,1,0,1,0,0,1],
    [1,0,4,1,0,0,0,0,0,0,1,0,0,0,1,0,5,1],
    [1,0,0,0,0,1,1,1,0,0,1,0,1,0,1,0,0,1],
    [1,0,1,0,0,0,0,0,0,4,0,0,1,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
    [1,3,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  treasures: [
    { id:'t1', x:15, y:1, type:'gold', value:25 },
    { id:'t2', x:2,  y:3, type:'gem', value:50 },
    { id:'t3', x:9,  y:5, type:'artifact', value:100 },
    { id:'t4', x:10, y:9, type:'coin', value:10 }
  ],
  playerSpawn: {x:1,y:1},
  aiSpawns: [{x:1,y:9},{x:15,y:9}],
  exit: {x:16,y:3}
};
```

Make sure every spawn, treasure, and exit location is on a walkable cell and every important destination is reachable.

## 7. Multiple levels

Implement at least **6 levels**.

### Level 1 — Ruins Entrance
- Small map
- Basic corridors
- 6 treasures
- Low obstacle density
- Tutorial-like introduction
- 1–2 AI agents depending on difficulty

### Level 2 — Forgotten Halls
- Medium map
- More branching corridors
- 8 treasures
- More alternative routes
- Slightly more complex path planning

### Level 3 — Crystal Caverns
- Medium/large map
- 10 treasures
- Narrow passages and longer routes
- More valuable distant treasures
- Stronger competition for high-value treasure

### Level 4 — Iron Fortress
- Large map
- 12 treasures
- Dense walls
- Several chokepoints
- AI must use A* around obstacles and Avoid between agents

### Level 5 — Lost Temple
- Large map
- 14 treasures
- Complex branching paths
- Multiple high-value artifacts
- Stronger AI target competition

### Level 6 — Treasure Vault
- Largest map
- 16+ treasures
- Highest obstacle complexity
- Multiple tempting high-value routes
- Strict timer
- Final challenge level

All levels must be handcrafted and deterministic first. Do not start with procedural generation; the academic AI behaviour should be easy to test and reproduce.

## 8. Difficulty system

Provide four selectable difficulty levels.

### Easy
- 1 AI opponent
- AI speed: 90 px/s
- AI decision interval: 350 ms
- AI perception radius: 9 tiles
- AI utility weights favor high-value safe treasures
- Limited competitor prediction
- Timer: generous
- Player movement: 180 px/s
- A* heuristic weight: 1.0

### Medium
- 2 AI opponents
- AI speed: 110 px/s
- AI decision interval: 250 ms
- AI perception radius: 11 tiles
- Balanced utility weights
- Basic competitor avoidance and target reservation
- Moderate timer
- Player movement: 180 px/s
- A* heuristic weight: 1.0

### Hard
- 3 AI opponents
- AI speed: 125 px/s
- AI decision interval: 180 ms
- AI perception radius: 14 tiles
- Stronger competition awareness
- AI may switch target when another competitor gets too close
- More aggressive high-value targeting
- Shorter timer
- Player movement: 180 px/s
- A* heuristic weight: 1.05

### Extreme
- 4 AI opponents
- AI speed: 140 px/s
- AI decision interval: 140 ms
- AI perception radius: 18 tiles
- Strong competition modelling
- Fast replanning
- More aggressive target choice
- Shortest timer
- Player movement: 175 px/s
- A* heuristic weight: 1.05

Difficulty should change actual AI behaviour and not merely change the timer.

## 9. Player controls

Primary controls:

- **W / Up Arrow** = move up
- **S / Down Arrow** = move down
- **A / Left Arrow** = move left
- **D / Right Arrow** = move right
- **P / Escape** = pause/unpause
- **R** = restart current level
- **M** = mute/unmute game sound
- **H** = show/hide controls/help
- **F1** = toggle AI debug visualization
- **N** = next level on the results screen after a successful level
- **Enter** = select/confirm in menus

Movement should support diagonal combinations such as W+D, but normalize velocity so diagonal movement is not faster than cardinal movement.

Do not let keyboard input move entities through walls.

## 10. Player movement specification

Player movement must be continuous in pixel coordinates, while collision uses the map grid.

Suggested values:
- speed = 180 px/s
- player radius = 18 px
- acceleration = optional 1000 px/s²
- deceleration = optional 1200 px/s²

Perform axis-separated collision resolution or swept collision checks so the player slides smoothly along walls instead of getting stuck.

Use a circular player collision body for simplicity.

## 11. Treasure system

Treasure classes:

- Coin = 10 points
- Gold = 25 points
- Gem = 50 points
- Artifact = 100 points

Use distinct visuals, for example:
- Coin: gold circle
- Gold: gold diamond
- Gem: cyan/blue diamond
- Artifact: purple crown/medallion

Give treasures a small glow/pulse effect.

A treasure is collected automatically when the player or an AI enters its pickup radius.

Suggested pickup radius: 22 px.

When collected:
- remove it from active treasures
- add its value to collector score
- increment collector treasure count
- show small floating `+VALUE` text
- play a short sound if audio is implemented
- trigger AI replanning for nearby AI agents because the world state changed

## 12. Level objective

Each level should have:
- time limit
- target score
- treasure count
- exit position

Example progression:
- L1 target score = 80
- L2 target score = 120
- L3 target score = 160
- L4 target score = 220
- L5 target score = 280
- L6 target score = 350

Victory condition:
1. Player has reached the target score or collected the required key artifact(s), AND
2. Player reaches the exit zone before time reaches zero.

Alternative emergency finish rule: if all treasures are collected before the target score condition is met, the level is immediately resolved as defeat for the player.

When time expires:
- stop gameplay
- compare scores
- if player reaches the level objective, victory
- otherwise defeat

For fairness, show the objective clearly in the HUD.

## 13. Score system

Every competitor has:
- `score`
- `treasuresCollected`
- `distanceTravelled`
- `currentTarget`
- `targetValue`

Leaderboard should update in real time.

Display:

```text
YOU        120
AI-1       95
AI-2       70
AI-3       40
```

Sort leaderboard descending by score.

Tie-breaker at the end:
1. higher score wins
2. if tied, greater number of treasures collected wins
3. if still tied, lower total path cost wins

## 14. AI design

Every AI agent must implement:

**Perception -> Utility Target Selection -> Decision State -> A* -> Steering -> Movement -> Collision -> Collection -> Re-evaluate**

AI must not simply choose the nearest treasure.

## 15. AI perception

At every AI decision tick, gather:
- AI current position
- active treasures within perception radius
- approximate path distance to candidate treasures
- treasure value
- obstacles/map grid
- human player position if visible/within perception radius
- other AI positions
- current AI score
- remaining time
- current target

If a target is outside perception range, the AI may remember its last known target briefly but should not magically know exact changes that occur outside its perception unless the difficulty configuration explicitly enables global awareness.

For stable gameplay, the AI may use a short memory window of 1–2 seconds.

## 16. AI utility function

Implement utility-based target selection.

Recommended normalized formula:

```text
Utility(target) =
    wValue * valueScore
  + wDistance * distanceScore
  + wRisk * riskScore
  + wCompetition * competitionScore
  + wTime * urgencyScore
```

Where:

```text
valueScore = treasureValue / maxTreasureValue

distanceScore = 1 / (1 + normalizedPathCost)

riskScore = 1 - normalizedRisk

competitionScore = 1 - competitorThreat

urgencyScore = 1 / (1 + distanceToTarget / remainingTime)
```

Weights should be difficulty dependent.

Default medium weights:
- value = 0.35
- distance = 0.25
- risk = 0.15
- competition = 0.15
- urgency = 0.10

Higher difficulty should increase competition and urgency influence.

The AI should calculate utility for every currently considered treasure, choose the highest-utility target, and log the choice in the debug panel.

Also store:
- target ID
- target utility
- estimated path cost
- reason for selection

Example reason:
`Artifact selected: utility 0.82, value 100, path cost 14, low competition.`

## 17. Competition model

The AI should not have perfect knowledge of every opponent.

For each visible competitor, estimate threat using:
- distance to the same target
- competitor movement direction
- competitor speed
- whether competitor already selected the target

Simple threat estimate:

```text
threat = clamp(competitorProximity * 0.6 + approachDirection * 0.4, 0, 1)
```

If another competitor is predicted to reach the target significantly earlier, reduce that target's competition score and consider a different treasure.

Implement a simple optional target reservation system:
- an AI may mark a target as its current intention
- other AI agents can observe reservations within perception range
- reservations are soft, not locking; multiple agents can still contest a treasure

## 18. AI finite state machine

Use these states:

```text
IDLE
SEARCHING
TARGETING
PATHFINDING
MOVING
AVOIDING
COLLECTING
REPLANNING
RETURNING
FINISHED
```

State behaviour:

- IDLE: wait briefly at level start
- SEARCHING: inspect valid targets
- TARGETING: evaluate utilities and select target
- PATHFINDING: compute A* route
- MOVING: follow route using steering
- AVOIDING: temporarily modify steering due to nearby obstacle/agent
- COLLECTING: finalize pickup and update score
- REPLANNING: invalidate stale path and select a new target/path
- RETURNING: optional state used after target collection when the level objective is nearly satisfied; proceed toward exit if strategically appropriate
- FINISHED: stop making gameplay decisions

## 19. A* pathfinding

Implement A* from scratch; do not replace it with a black-box navigation library.

Grid neighbours: 4-directional (up, down, left, right) for deterministic Manhattan costs.

Formula:

```text
f(n) = g(n) + h(n)
```

Where:
- `g(n)` = actual cost from start
- `h(n)` = Manhattan distance to goal
- `f(n)` = total estimated cost

Use a binary min-heap priority queue.

Recommended costs:
- orthogonal step = 1
- blocked cells = not traversable

Return:
- path as ordered grid coordinates
- path cost
- nodes expanded
- success/failure

Handle no-path cases safely:
- do not crash
- mark target temporarily unreachable
- evaluate another target
- retry after world changes

Store debug information so the path can be visualized.

## 20. Steering behaviours

A* answers **where to go**. Steering answers **how to move smoothly**.

Implement:

### Seek
```text
desiredVelocity = normalize(targetPosition - currentPosition) * maxSpeed
steering = desiredVelocity - currentVelocity
```

### Arrive
Slow down when near the next waypoint.

Example:
```text
speed = maxSpeed * clamp(distance / slowingRadius, 0, 1)
```

### Avoid
Repel the agent from nearby:
- walls
- obstacles
- other AI agents
- human player

Combine steering:

```text
combined =
    seek * seekWeight
  + arrive * arriveWeight
  + avoid * avoidWeight
```

Normalize/clamp acceleration to prevent unstable movement.

Suggested weights:
- seek = 1.0
- arrive = 1.0
- avoid = 2.0

Increase avoid weight slightly in narrow passages or on harder difficulties.

## 21. Waypoint following

A* returns cell centers.

AI movement procedure:
1. Take the next cell center as waypoint.
2. Seek toward it.
3. Use Arrive inside 10–14 px.
4. If another agent blocks the corridor, use Avoid.
5. When within waypoint threshold, advance to the next waypoint.
6. If target disappears, replan immediately.
7. If path becomes invalid because of dynamic blocking, replan.

Do not draw a rigid tile-by-tile instant teleport.

## 22. Replanning rules

Re-evaluate when:
- current target is collected by another competitor
- another competitor becomes an immediate threat
- current path becomes invalid
- AI gets stuck for > 0.8 seconds
- target is no longer visible/known according to perception rules
- target utility drops significantly
- player reaches the exit/level ends
- timer urgency becomes high

Use the AI difficulty decision interval rather than recalculating A* every rendered frame.

## 23. AI stuck detection

Track:
- previous position
- current position
- time since meaningful displacement

If movement distance remains below 6 px for > 0.8 seconds while a target exists:
- mark current path as blocked/stale
- enter REPLANNING
- temporarily increase Avoid weight
- choose a different target if necessary

## 24. AI behaviour should be visibly different by difficulty

Easy:
- tends to take safe high-value targets
- slower reactions
- weaker competition modelling

Medium:
- balances value and distance
- recognizes competitors

Hard:
- frequently changes target if competitor is likely to win it
- handles crowded corridors better
- replans faster

Extreme:
- aggressive target optimization
- faster reactions
- strong competition awareness
- can intercept or contest high-value treasures

Do not make Extreme unfair by giving perfect information about all hidden treasures.

## 25. Level scaling

As level number increases:
- map size increases
- obstacle density increases
- treasure count increases
- high-value treasures become more strategically placed
- path lengths increase
- target score increases
- time becomes tighter
- AI competition becomes more important

Do not make levels impossible by simply increasing AI speed. Increase complexity through map design first.

## 26. Start countdown

At the start of every level:
- show `3`
- show `2`
- show `1`
- show `GO!`
- only then allow AI and player movement

AI should also begin from the same start signal to keep the race fair.

## 27. HUD

During play, display:

Top-left:
- Level name
- Difficulty
- Objective

Top-center:
- Remaining time

Top-right:
- Player score

Right-side or lower-right:
- Leaderboard

Bottom:
- Controls hint

Optional AI info panel:
```text
AI-1
State: MOVING
Target: Artifact
Utility: 0.82
Path Cost: 14
Reason: High value / low competition
```

## 28. AI debug visualization

Toggle with F1.

When enabled, show:
- walkable grid overlay
- blocked cells
- current AI target marker
- A* path as a polyline
- waypoint dots
- perception radius
- nearby competitor markers
- current state label above AI
- utility score next to each candidate treasure if practical
- nodes expanded by A* using a subtle debug overlay

Add a small legend.

Debug mode should be toggleable and must not affect gameplay logic.

## 29. AI explanation panel

Provide an optional `AI Analysis` panel designed for academic demonstration.

Show for selected AI:

```text
AI Analysis
-----------
State: TARGETING
Target: Diamond
Value: 100
Path Cost: 12
Risk: 0.10
Competition: 0.15
Utility: 0.83
Decision: Pursue Diamond
Next Action: Follow A* path
```

Update this panel at decision ticks, not every render frame.

## 30. Menus

### Main Menu
Buttons:
- Play
- Tutorial
- Level Select
- How AI Works
- Settings

### Difficulty screen
Cards:
- Easy
- Medium
- Hard
- Extreme

Show concise differences for each.

### Level Select
Display six level cards.
- Level 1 unlocked initially
- Level 2 unlocks after Level 1 victory
- etc.
- Store unlocked level in `localStorage`

Allow replaying completed levels.

### Tutorial
Explain:
- objective
- player controls
- treasure values
- exit requirement
- AI competition
- difficulty
- debug mode

### How AI Works
Show a simple visual flow:

`Perception -> Utility -> A* -> Steering -> Movement -> Re-evaluation`

Briefly explain each component.

## 31. Pause screen

When P or Escape is pressed during gameplay:
- freeze timer
- freeze player
- freeze all AI
- freeze animations that depend on simulation time
- show overlay

Buttons:
- Resume
- Restart Level
- Main Menu

## 32. Result screen

After each level:

Show:
- Victory or Defeat
- Player score
- Each AI score
- Treasures collected
- Time remaining
- Winner
- Level number
- performance summary

If victory:
- unlock next level
- show `Next Level`

If defeat:
- show `Try Again`

Also show a compact AI analytics summary:
- most valuable target chosen by AI
- number of replans
- average path cost
- AI target switches

This is useful for demonstration and report screenshots.

## 33. Audio and visual feedback

Optional but recommended:
- treasure pickup sound
- menu click sound
- countdown sound
- victory/defeat sound
- subtle movement feedback

Do not let missing audio files crash the game.

Visual effects:
- treasure pulse
- collectible flash
- score floating text
- exit glow
- small shadows under actors
- smooth movement
- subtle camera shake only for major events, not constantly

Keep visual effects lightweight.

## 34. Characters

Since the supplied environment pack is environment-oriented and may not contain character sprites, create characters in canvas/SVG.

Human:
- blue player marker
- circular/rounded body
- direction indicator
- small nameplate `YOU`

AI:
- distinct colors/visual symbols
- labels `AI-1`, `AI-2`, etc.
- optional animated pulse to distinguish from the player

Do not use copyrighted character art.

## 35. Collision system

Collision must work for:
- player vs walls
- AI vs walls
- player vs AI
- AI vs AI
- actors vs map boundaries

Actors should not pass through walls.

Treasure should not block movement.

Exit should be non-blocking.

For AI-agent collision:
- use soft Avoid steering first
- add physical separation only when entities overlap

## 36. Fairness rules

- Human and AI begin simultaneously.
- Treasures disappear for everyone after pickup.
- AI cannot teleport.
- AI cannot walk through walls.
- AI cannot directly modify player score.
- AI decisions are based on configurable perception/knowledge.
- Difficulty affects decision quality, reaction speed, and competition modelling rather than arbitrary cheating.

## 37. Save data

Use localStorage only.

Store:
- unlocked levels
- last selected difficulty
- sound on/off
- debug preference
- best player score per level/difficulty

Do not store live game state unless needed.

## 38. Rendering requirements

Use nearest-neighbour style rendering where appropriate for tile art so assets remain crisp.

Do not stretch individual 64x64 source art unevenly.

Use a deterministic draw order:
1. background
2. floor tiles
3. walls/obstacles
4. decorative effects
5. treasures
6. exit
7. AI agents
8. player
9. debug overlays
10. UI

## 39. Responsive browser behaviour

Desktop-first.

Target viewport:
- 1280x720
- 1366x768
- 1920x1080

Scale canvas to fit while maintaining aspect ratio.

Do not distort the map.

If viewport is smaller, reduce render scale or allow a small camera viewport.

## 40. Game state machine

Use:

```text
BOOT
MENU
DIFFICULTY_SELECT
LEVEL_SELECT
TUTORIAL
HOW_AI_WORKS
LOADING_LEVEL
COUNTDOWN
PLAYING
PAUSED
LEVEL_COMPLETE
LEVEL_FAILED
GAME_COMPLETE
```

Never mix menu logic with gameplay logic.

## 41. Main game loop

Use this conceptual sequence:

```text
while running:
    readInput()
    updateGameState(deltaTime)
    updatePlayer(deltaTime)
    updateAI(deltaTime)
    updateSteering(deltaTime)
    resolveCollisions()
    processTreasureCollection()
    updateScoreboard()
    updateTimer(deltaTime)
    checkObjective()
    render()
```

AI decision calculations should happen on their own decision interval, not necessarily every render frame.

## 42. A* priority queue

Implement a binary heap priority queue.

Required operations:
- `enqueue(node, priority)`
- `dequeue()`
- `isEmpty()`
- optional `updatePriority()` or allow duplicate queue entries with stale-entry checking

Use a Map for scores and a Set for closed nodes.

Write unit tests for:
- straight route
- obstacle detour
- unreachable target
- start equals goal
- multiple equal-cost routes

## 43. Utility target tests

Write tests for:
- nearest low-value treasure vs distant high-value treasure
- high competition making a target less attractive
- unreachable treasure excluded
- no active treasures
- one remaining target

The utility selector should return the selected target plus a breakdown of component scores.

## 44. Performance

Target a stable 60 FPS rendering experience on a normal laptop.

Optimizations:
- cache loaded images
- do not recreate large arrays every render frame
- run AI decision logic on intervals
- re-use data structures where practical
- do not run A* every frame
- keep debug overlays off by default

## 45. Error handling

The application must not crash because of:
- missing image
- bad level data
- unreachable treasure
- no current target
- no A* path
- malformed localStorage
- window resize

Use safe defaults and visible console warnings.

## 46. Testing checklist

Test every feature manually.

### Player
- WASD works
- arrow keys work
- diagonal movement is normalized
- wall collision works
- pause works
- restart works

### AI
- every AI chooses targets dynamically
- target utility is computed
- A* returns valid routes
- AI follows path smoothly
- AI avoids obstacles and competitors
- AI replans when target disappears
- AI does not become permanently stuck

### Game rules
- treasure can be collected only once
- score updates correctly
- timer stops on pause
- exit only completes the level when objective is satisfied
- victory unlocks next level
- defeat does not unlock next level

### UI
- menu buttons work
- difficulty selection works
- level selection works
- tutorial works
- result screen works
- leaderboard updates
- debug mode works

### Persistence
- unlocked levels persist after refresh
- difficulty preference persists
- settings persist

## 47. Automated verification

At the end of each major development phase:
1. launch a local server
2. open the game in the browser
3. verify the feature in the browser
4. inspect the console for errors
5. fix errors before continuing

Use Antigravity's browser capabilities where available for UI testing and visual verification.

Create a `README.md` with:
- project title
- features
- technology stack
- controls
- AI architecture
- how to run
- game rules
- difficulty table
- level list
- A* explanation
- steering explanation
- utility function
- testing instructions

## 48. Academic AI transparency

The game must make it easy to demonstrate that it is genuinely using AI/game-AI concepts.

Required evidence visible in the implementation:
- Utility calculation for each target
- A* path generation
- state transitions
- steering calculations
- dynamic replanning
- competition-aware target selection
- debug visualization

Do not describe the AI as machine learning. This project is primarily **game AI / symbolic and algorithmic AI**, using algorithms, data structures, utility evaluation, pathfinding, finite state machines, and steering behaviours.

## 49. Mapping to Unit 3 concepts

Ensure the implementation clearly demonstrates:
- Model of Game AI -> AI controller + game loop
- Algorithms and Data Structures -> A*, priority queue, grid, sets/maps
- Complexity considerations -> bounded grid, decision intervals, efficient queues
- Kind of AI in Games -> reactive + deliberative utility-based agent
- Speed and Memory Constraints -> cached assets and periodic decision updates
- AI Engine -> AIController and supporting AI modules
- Kinematic Movement -> velocity, acceleration, movement update
- Steering Behaviours -> Seek, Arrive, Avoid
- Combining Steering Behaviours -> weighted steering
- Coordinated Movement -> soft separation/avoidance between agents
- Path Finding -> A*
- Movement Planning -> waypoint path + dynamic replanning
- Designing Game AI -> perception/decision/action loop
- AI-Based Game Genre -> competitive treasure-hunting dungeon game

## 50. Recommended map/visual themes using the supplied assets

Use different available floor/wall styles so levels visually feel different without requiring new art.

Example:
- Level 1: Stone floor + Brick wall
- Level 2: Sand floor + Sand/Stone wall
- Level 3: Grass/Dirt floor + Dirt wall
- Level 4: Metal floor + Concrete/Metal wall
- Level 5: Wood floor + Brick wall
- Level 6: Glass/Stone floor + Metal wall

Add decorative variation by alternating compatible floor textures, while keeping collision independent of visual texture.

## 51. Recommended first implementation order

### Phase 1 — Project skeleton
- create folders
- create index.html
- create base CSS
- create module entrypoint
- create local storage helpers
- verify blank game starts

### Phase 2 — Asset pipeline and map
- copy selected 64x64 PNG assets
- build level 1 grid
- render tiles
- render walls
- render exit
- verify map coordinates

### Phase 3 — Human player
- keyboard input
- smooth movement
- collision
- player rendering

### Phase 4 — Treasures and scoring
- treasure data
- treasure rendering
- pickup detection
- score
- timer
- HUD

### Phase 5 — Basic AI
- AI entity
- perception
- nearest-target baseline only for internal debugging
- movement to waypoints

### Phase 6 — A* pathfinding
- priority queue
- A*
- grid integration
- path rendering
- unreachable-target handling

### Phase 7 — Real AI decision making
- utility selector
- competition model
- FSM
- dynamic replanning

### Phase 8 — Steering
- Seek
- Arrive
- Avoid
- weighted combination
- stuck detection

### Phase 9 — Difficulty
- Easy/Medium/Hard/Extreme parameter profiles
- AI count
- reaction interval
- speed
- perception radius
- utility weights
- timers

### Phase 10 — Multiple levels
- implement all six levels
- level unlocking
- level select
- progression

### Phase 11 — UX and polish
- menu
- tutorial
- AI explanation screen
- debug mode
- result screen
- visual effects
- audio fallback

### Phase 12 — Testing and cleanup
- unit tests
- browser tests
- bug fixing
- README
- final polish

## 52. Acceptance criteria

The project is complete only when all of these are true:

1. The browser game launches without console errors.
2. The human player can move using WASD and arrow keys.
3. Player cannot cross walls.
4. There are at least six playable levels.
5. There are four difficulty levels.
6. Difficulty changes actual AI behaviour.
7. At least two AI agents can compete in normal difficulty modes.
8. Treasures have different values.
9. The player and AI can collect treasures.
10. Scoreboard updates correctly.
11. Timer works and pauses correctly.
12. The exit works according to the level objective.
13. A* is visibly used for AI navigation.
14. Utility scoring is visibly used for target selection.
15. Seek, Arrive, and Avoid are implemented and combined.
16. AI can replan when the world changes.
17. AI state is visible in debug mode.
18. A* path is visible in debug mode.
19. Level progression works.
20. LocalStorage level unlocking works.
21. Restart and pause work.
22. The game remains playable at a stable frame rate.
23. No AI agent permanently gets stuck during normal test runs.
24. README explains how to run and how the AI works.

## 53. Important implementation guardrails

- Do not replace the custom A* implementation with random movement.
- Do not replace utility target selection with nearest treasure only.
- Do not run A* on every render frame.
- Do not let AI teleport or ignore collision.
- Do not make all difficulty levels identical.
- Do not make every level use the same exact map.
- Do not rely on external online APIs at runtime.
- Do not expose hidden internal debug data in normal mode.
- Do not make the UI cluttered; debug mode should be opt-in.
- Do not introduce a backend unless absolutely necessary.
- Prefer deterministic maps and deterministic AI random seeds for reproducible demos.

## 54. Deterministic randomness

Where randomness is needed for:
- decorative treasure placement
- slight AI tie-breaking
- effect timing

use a seeded pseudo-random generator based on level number + selected difficulty. This makes the same demo reproducible.

## 55. AI decision log

Maintain a small in-memory event log of the latest 20 AI decisions.

Each record:
```js
{
  timestamp,
  agentId,
  oldState,
  newState,
  targetId,
  targetType,
  targetValue,
  pathCost,
  utility,
  reason
}
```

Show the last few events in debug mode.

Example:
```text
00:42 AI-2 TARGETING -> MOVING
Target: Artifact
Utility: 0.84
Path: 13 cells
Reason: high value, reachable, low competitor threat
```

## 56. Final user experience

The ideal gameplay sequence is:

1. User opens `index.html` through a local server.
2. Main menu appears.
3. User clicks Play.
4. User chooses difficulty.
5. User selects unlocked level.
6. Short tutorial reminder appears.
7. 3-2-1-GO countdown.
8. Player moves with WASD/arrow keys.
9. AI agents perceive available treasure.
10. AI agents score targets using utility.
11. AI agents choose targets.
12. A* computes routes.
13. Steering moves AI smoothly through the dungeon.
14. AI avoids walls and other agents.
15. Player and AI compete for treasure.
16. AI replans whenever a target disappears or becomes strategically poor.
17. Scoreboard and timer update continuously.
18. Player reaches the required score and then reaches the exit.
19. Result screen shows winner and analytics.
20. Next level unlocks after victory.
21. Difficulty and level can be changed from the menu.

## 57. Final instruction to Antigravity

Do not attempt to build everything blindly in one step.

First inspect the workspace and the supplied dungeon asset archive. Then produce a concise implementation plan and begin Phase 1. After each phase, run the project, verify the feature in the browser, inspect console errors, and fix issues before proceeding.

Keep all important AI calculations in readable, named functions so the project can be demonstrated and explained during a college viva.

The final product should feel like a real small game, not a technical demo: polished menu, clear controls, responsive movement, attractive dungeon environment, competitive AI, visible feedback, multiple difficulties, multiple levels, and a reliable result/progression system.
