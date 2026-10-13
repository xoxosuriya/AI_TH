// =========================================================================
// AI Treasure Hunter: Royal Artifact Edition — Automated Test Runner
// =========================================================================

import { runAStarTests } from './astar.test.js';
import { runUtilityTests } from './utility.test.js';
import { runLevelTests } from './level.test.js';
import { runCollisionTests } from './collision.test.js';
import { runSimulationTests } from './simulation.test.js';

console.log('\n=============================================================');
console.log('  AI TREASURE HUNTER: ROYAL ARTIFACT EDITION — TEST SUITE');
console.log('=============================================================\n');

const suites = [
    { name: 'A* Pathfinding & Min-Heap Priority Queue', runner: runAStarTests },
    { name: 'Utility Decision Function & Heuristic Scoring', runner: runUtilityTests },
    { name: 'Handcrafted Levels & Path Reachability', runner: runLevelTests },
    { name: 'Collision System & Vector Kinematics', runner: runCollisionTests },
    { name: 'Multi-Agent Simulation & Lifecycle Execution', runner: runSimulationTests }
];

let totalPassed = 0;
let totalFailed = 0;

for (const suite of suites) {
    console.log(`\n\x1b[1m\x1b[36m>> SUITE: ${suite.name}\x1b[0m`);
    const results = suite.runner();
    
    for (const res of results) {
        if (res.pass) {
            console.log(`  \x1b[32m\u2713 PASS:\x1b[0m ${res.name}`);
            totalPassed++;
        } else {
            console.log(`  \x1b[31m\u2717 FAIL:\x1b[0m ${res.name} \x1b[33m(${res.error || 'Failed'})\x1b[0m`);
            totalFailed++;
        }
    }
}

console.log('\n-------------------------------------------------------------');
console.log(`Test Execution Summary:`);
console.log(`  Total Passed: \x1b[32m${totalPassed}\x1b[0m`);
console.log(`  Total Failed: \x1b[${totalFailed > 0 ? '31' : '32'}m${totalFailed}\x1b[0m`);
console.log('=============================================================\n');

if (totalFailed > 0) {
    process.exit(1);
} else {
    console.log('\x1b[32mAll test specifications verified successfully!\x1b[0m\n');
    process.exit(0);
}
