# 💎 AI Treasure Hunter

> **Design of AI Products — Unit 3**
> A competitive multi-agent treasure-hunting game built with HTML5 Canvas and vanilla JavaScript ES modules. No frameworks. No build step.

---

## 🎮 What Is This?

A real-time competitive game where **you race against AI agents** to collect treasures and reach the exit before time runs out. The AI agents demonstrate core AI techniques:

| Technique | Implementation |
|-----------|---------------|
| **A\* Pathfinding** | Binary min-heap priority queue, Manhattan heuristic |
| **Utility-Based Decision Making** | Weighted scoring across value, distance, risk, competition & urgency |
| **Finite State Machine** | IDLE → SEARCHING → MOVING → COLLECTING → REPLANNING |
| **Steering Behaviours** | Seek, Arrive, Avoid — combined with weighted blending |
| **Perception System** | Radius-limited sensing with short-term memory |
| **Competition Modelling** | Threat estimation based on proximity, approach vector & reservation |

Press **F1** during gameplay to see all of this visualised in real time.

---

## 🚀 How to Run

You can run with either **Node.js** or **Python 3**:

```bash
# Option 1: Node.js (Recommended)
npm start
# or: node server.mjs
```

```bash
# Option 2: Python 3
python -m http.server 3000
```

Then open **http://localhost:3000** in your browser.

> ⚠️ Must be served over HTTP — ES modules require an HTTP server context.

---

## 🕹️ Controls

| Key | Action |
|-----|--------|
| `W A S D` or `↑ ↓ ← →` | Move player |
| `P` or `Escape` | Pause / Resume |
| `R` | Restart current level |
| `F1` | Toggle AI debug overlay |
| `M` | Toggle sound (mute) |
| `N` | Next level (on Victory screen) |

---

## 🏆 Objective

1. **Collect treasures** to reach the target score shown in the top-left HUD.
2. Once the target is met, the **EXIT portal glows green** — reach it to win!
3. If the timer hits 0 before you reach the exit, it is **DEFEAT**.

### Treasure Values

| Type | Points | Shape |
|------|--------|-------|
| Coin | 10 | Circle |
| Gold | 25 | Diamond |
| Gem | 50 | Hexagon |
| Artifact | 100 | Star |

---

## 🤖 AI Agent Architecture

Each AI agent runs this pipeline every decision tick:

```
┌─────────────┐    ┌──────────────┐    ┌───────────┐    ┌──────────────┐
│  PERCEPTION │───▶│   UTILITY    │───▶│  A* PATH  │───▶│  STEERING    │
│  radius scan│    │  scoring     │    │  finding  │    │  seek/arrive │
│  + memory   │    │  per target  │    │  on grid  │    │  + avoid     │
└─────────────┘    └──────────────┘    └───────────┘    └──────────────┘
```

**Utility Function:**
```
U(t) = wValue·V + wDistance·D + wRisk·R + wCompetition·C + wUrgency·U
```

**FSM States:**
```
IDLE ──▶ SEARCHING ──▶ MOVING ──▶ COLLECTING ──▶ SEARCHING
                          │                            ▲
                          └──▶ REPLANNING ─────────────┘
```

---

## 🗺️ Difficulty Levels

| Difficulty | AI Count | AI Speed | Reaction | Perception | Timer |
|------------|----------|----------|----------|------------|-------|
| Easy | 1 | 90 px/s | 350 ms | 9 tiles | ×1.4 |
| Medium | 2 | 110 px/s | 250 ms | 11 tiles | ×1.0 |
| Hard | 3 | 125 px/s | 180 ms | 14 tiles | ×0.75 |
| Extreme | 4 | 140 px/s | 140 ms | 18 tiles | ×0.60 |

---

## 🏛️ Levels

| # | Name | Size | Target | Theme |
|---|------|------|--------|-------|
| 1 | Ruins Entrance | 20×12 | 80 pts | Stone/Brick |
| 2 | Forgotten Halls | 22×13 | 120 pts | Sand/Stone |
| 3 | Crystal Caverns | 22×14 | 160 pts | Dirt |
| 4 | Iron Fortress | 24×14 | 220 pts | Metal/Concrete |
| 5 | Lost Temple | 24×15 | 280 pts | Wood/Brick |
| 6 | Treasure Vault | 26×15 | 350 pts | Glass/Metal |

Levels unlock sequentially — complete a level to unlock the next.

---

## 📁 Project Structure

```
ai-treasure-hunter/
├── index.html                  # Entry point (canvas, loading screen, roundRect polyfill)
├── README.md                   # This file
├── assets/
│   └── tiles/
│       ├── floors/             # 64×64 floor tile PNGs
│       └── walls/              # 64×64 wall tile PNGs
└── src/
    ├── main.js                 # Bootstrap — creates Game, awaits asset load
    ├── config.js               # All constants (tile size, speeds, GAME_STATES, AI_STATES)
    ├── ai/
    │   ├── AStar.js            # A* on 4-directional grid, binary min-heap
    │   ├── PriorityQueue.js    # Binary min-heap used by A*
    │   ├── Perception.js       # Radius-limited sensing + short-term memory
    │   ├── StateMachine.js     # Generic FSM with transition history
    │   ├── Steering.js         # Seek, Arrive, Avoid, combineForces, applyForce
    │   ├── UtilityTargetSelector.js  # Utility scoring + target selection
    │   └── CompetitionModel.js # Threat estimation from nearby competitors
    ├── entities/
    │   ├── Entity.js           # Base class: position, velocity, wall-sliding collision
    │   ├── Player.js           # Human player with keyboard input
    │   ├── AIAgent.js          # AI agent: FSM + Perception + A* + Steering
    │   ├── Treasure.js         # Treasure entity: pulse animation, pickup detection
    │   └── Exit.js             # Exit portal: glow when objective met
    ├── game/
    │   ├── Game.js             # Central orchestrator: state machine, game loop, systems
    │   └── Camera.js           # World-to-screen transform, follow, shake
    ├── maps/
    │   ├── levels.js           # All 6 handcrafted level definitions (grid + metadata)
    │   └── MapManager.js       # Grid parsing, walkability, neighbor queries
    ├── rendering/
    │   ├── Renderer.js         # Tile drawing, debug overlay, leaderboard
    │   ├── Effects.js          # Floating score text, flash circles
    │   └── AssetLoader.js      # Async image loading with null-fallback
    ├── ui/
    │   ├── MenuUI.js           # All canvas menu screens (main, difficulty, level, pause)
    │   ├── HUD.js              # In-game HUD: timer, scores, progress bar, hints
    │   └── DebugPanel.js       # F1 debug panel: agent states, utility breakdown, log
    └── utils/
        ├── input.js            # Keyboard InputManager (keydown/keyup, wasPressed, flush)
        ├── math.js             # clamp, lerp, dist, normalize, manhattan, gridToWorld
        └── storage.js          # localStorage helpers (difficulty, unlocked levels, scores)
```

---

## 🔧 Tech Stack

- **Language:** Vanilla JavaScript (ES2022 modules)
- **Rendering:** HTML5 Canvas 2D API — 1280×720, tile size 64px
- **Pathfinding:** Custom A\* with binary min-heap
- **Assets:** PNG tile sprites (64×64), canvas-drawn entities
- **Storage:** `localStorage` for preferences and best scores
- **Server:** Python `http.server` (development only)
- **Frameworks:** **None**

---

## 🐛 Debug Mode (F1)

When active, the overlay shows for each AI agent:

- **Dashed circle** — perception radius
- **Coloured path line + dots** — current A\* waypoints
- **Dashed target ring** — currently targeted treasure
- **State label** — current FSM state (MOVING, REPLANNING, etc.)
- **Utility score** — `U:0.856` next to the target
- **Right-side panel** — per-agent breakdown (V/D/C scores, reason, decision log)

---

## 📝 Notes

- All grid cell types: `0`=walkable, `1`=wall, `2`=player spawn, `3`=AI spawn, `4`=treasure, `5`=exit
- Treasure `col`/`row` in level definitions map to pixel positions via `col × 64 + 32`
- Camera follows player with clamped bounds; shakes on pickup
- AI agents have a staggered idle start delay so they don't all path simultaneously on frame 1
