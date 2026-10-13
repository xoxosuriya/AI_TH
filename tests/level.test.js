// Tests for Handcrafted Level Integrity and Path Reachability
import { levels } from '../src/maps/levels.js';
import { AStar } from '../src/ai/AStar.js';

export function runLevelTests() {
    const results = [];

    // Test 1: Exactly 6 levels present
    if (levels.length === 6) {
        results.push({ name: 'All 6 handcrafted levels defined', pass: true });
    } else {
        results.push({ name: 'All 6 handcrafted levels defined', pass: false, error: `Found ${levels.length} levels` });
    }

    // Test 2: Dimensional grid consistency for all 6 levels
    for (let i = 0; i < levels.length; i++) {
        const lvl = levels[i];
        let dimensionsValid = true;
        let dimError = '';

        if (!lvl.grid || lvl.grid.length !== lvl.height) {
            dimensionsValid = false;
            dimError = `Height mismatch: expected ${lvl.height}, got ${lvl.grid?.length}`;
        } else {
            for (let r = 0; r < lvl.grid.length; r++) {
                if (lvl.grid[r].length !== lvl.width) {
                    dimensionsValid = false;
                    dimError = `Row ${r} width mismatch: expected ${lvl.width}, got ${lvl.grid[r].length}`;
                    break;
                }
            }
        }

        results.push({
            name: `Level ${lvl.number} (${lvl.name}) geometry (${lvl.width}x${lvl.height})`,
            pass: dimensionsValid,
            error: dimError
        });
    }

    // Test 3: Outer perimeter walls enclosed
    for (const lvl of levels) {
        let enclosed = true;
        // Top and bottom row
        for (let x = 0; x < lvl.width; x++) {
            if (lvl.grid[0][x] !== 1 || lvl.grid[lvl.height - 1][x] !== 1) {
                enclosed = false;
                break;
            }
        }
        // Left and right columns
        for (let y = 0; y < lvl.height; y++) {
            if (lvl.grid[y][0] !== 1 || lvl.grid[y][lvl.width - 1] !== 1) {
                enclosed = false;
                break;
            }
        }

        results.push({
            name: `Level ${lvl.number} perimeter wall enclosure`,
            pass: enclosed,
            error: enclosed ? '' : 'Boundary cell not wall (1)'
        });
    }

    // Test 4: Walkability of Player, AI, Exit, and Treasures
    for (const lvl of levels) {
        let spawnsWalkable = true;
        let spawnError = '';

        if (lvl.grid[lvl.playerSpawn.y][lvl.playerSpawn.x] !== 0) {
            spawnsWalkable = false;
            spawnError = `Player spawn (${lvl.playerSpawn.x},${lvl.playerSpawn.y}) blocked`;
        }

        if (lvl.grid[lvl.exit.y][lvl.exit.x] !== 0) {
            spawnsWalkable = false;
            spawnError = `Exit (${lvl.exit.x},${lvl.exit.y}) blocked`;
        }

        for (let a = 0; a < lvl.aiSpawns.length; a++) {
            const sp = lvl.aiSpawns[a];
            if (lvl.grid[sp.y][sp.x] !== 0) {
                spawnsWalkable = false;
                spawnError = `AI spawn ${a} (${sp.x},${sp.y}) blocked`;
                break;
            }
        }

        for (const tr of lvl.treasures) {
            if (lvl.grid[tr.y][tr.x] !== 0) {
                spawnsWalkable = false;
                spawnError = `Treasure at (${tr.x},${tr.y}) blocked`;
                break;
            }
        }

        results.push({
            name: `Level ${lvl.number} spawns & treasures placed on open floor`,
            pass: spawnsWalkable,
            error: spawnError
        });
    }

    // Test 5: A* reachability from player spawn to exit
    for (const lvl of levels) {
        const astar = new AStar(lvl.grid);
        const path = astar.findPath(lvl.playerSpawn, lvl.exit);
        const reachable = path !== null && path.length > 0;

        results.push({
            name: `Level ${lvl.number} Exit reachable via A* from spawn (steps: ${path ? path.length : 0})`,
            pass: reachable,
            error: reachable ? '' : 'No path found to exit'
        });
    }

    // Test 6: Treasure value meets quota target
    for (const lvl of levels) {
        const totalValue = lvl.treasures.reduce((sum, t) => sum + t.value, 0);
        const quotaAchievable = totalValue >= lvl.targetScore;

        results.push({
            name: `Level ${lvl.number} total treasure value (${totalValue} pts) meets target quota (${lvl.targetScore} pts)`,
            pass: quotaAchievable,
            error: quotaAchievable ? '' : `Target ${lvl.targetScore} > total ${totalValue}`
        });
    }

    return results;
}
