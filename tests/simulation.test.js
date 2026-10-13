// =========================================================================
// Simulation Test Suite: Full EntityManager Multi-Agent Lifecycle
// =========================================================================

import { levels } from '../src/maps/levels.js';
import { MapManager } from '../src/maps/MapManager.js';
import { EntityManager } from '../src/systems/EntityManager.js';
import { Player } from '../src/entities/Player.js';
import { AIAgent } from '../src/entities/AIAgent.js';
import { Treasure } from '../src/entities/Treasure.js';
import { Exit } from '../src/entities/Exit.js';
import { Entity } from '../src/entities/Entity.js';

export function runSimulationTests() {
    const results = [];
    const assert = (name, cond, msg = '') => {
        results.push({ name, pass: Boolean(cond), error: cond ? null : msg });
    };

    try {
        const rivalNames = ['Lord Alistair', 'Lady Vivienne', 'Sir Rowan', 'Corvus the Rogue'];
        
        for (let i = 0; i < levels.length; i++) {
            const lvl = levels[i];
            const map = new MapManager();
            map.loadLevel(lvl);

            const em = new EntityManager();
            em.setFactories({
                player: (x, y, opts) => new Player(x, y, opts),
                agent: (x, y, id, opts) => new AIAgent(x, y, id, opts),
                treasure: (x, y, type, opts) => new Treasure(x, y, type, opts),
                exit: (x, y, opts) => new Exit(x, y, opts),
                obstacle: (x, y, opts) => new Entity(x, y, 'wall', { radius: 30 })
            });

            em.obstacles = map._obstacles || [];

            const pSpawn = map.getPlayerSpawn();
            em.createPlayer(pSpawn.x * 64 + 32, pSpawn.y * 64 + 32);

            for (let a = 0; a < 4; a++) {
                const s = lvl.aiSpawns[a % lvl.aiSpawns.length];
                em.createAIAgent(s.x * 64 + 32, s.y * 64 + 32, a, {
                    name: rivalNames[a],
                    speed: 110,
                    difficulty: 'hard'
                });
            }

            for (const t of lvl.treasures) {
                em.createTreasure(t.x * 64 + 32, t.y * 64 + 32, t.type);
            }

            em.createExit(lvl.exit.x * 64 + 32, lvl.exit.y * 64 + 32);

            // Run 60 ticks (1 simulated second)
            const dt = 1 / 60;
            let tickError = null;
            try {
                for (let frame = 0; frame < 60; frame++) {
                    em.update(dt, { time: frame * 16.6, targetScore: lvl.targetScore });
                }
            } catch (err) {
                tickError = err.message;
            }

            assert(`Level ${i + 1} (${lvl.name}) 4-Agent 60-tick simulation without exception`, !tickError, tickError);
            assert(`Level ${i + 1} Player active after simulation`, em.player && em.player.active);
            assert(`Level ${i + 1} All 4 AI rivals active`, em.aiAgents.length === 4 && em.aiAgents.every(a => a.active));
        }
    } catch (err) {
        assert('Simulation suite execution error', false, err.message);
    }

    return results;
}
