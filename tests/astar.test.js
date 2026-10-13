// Tests for A* Pathfinding and Min-Heap Priority Queue
import { AStar } from '../src/ai/AStar.js';
import { PriorityQueue } from '../src/ai/PriorityQueue.js';

export function runAStarTests() {
    const results = [];

    // Test 1: PriorityQueue min-heap ordering
    try {
        const pq = new PriorityQueue();
        pq.enqueue('C', 30);
        pq.enqueue('A', 10);
        pq.enqueue('B', 20);
        pq.enqueue('Z', 5);

        const first = pq.dequeue();
        const second = pq.dequeue();
        const third = pq.dequeue();
        const fourth = pq.dequeue();

        if (first === 'Z' && second === 'A' && third === 'B' && fourth === 'C') {
            results.push({ name: 'PriorityQueue min-heap order', pass: true });
        } else {
            results.push({ name: 'PriorityQueue min-heap order', pass: false, error: `Got: ${first}, ${second}, ${third}, ${fourth}` });
        }
    } catch (e) {
        results.push({ name: 'PriorityQueue min-heap order', pass: false, error: e.message });
    }

    // Test 2: Simple direct path
    try {
        const grid = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        const astar = new AStar(grid);
        const path = astar.findPath({ x: 0, y: 0 }, { x: 2, y: 2 });
        if (path && path.length >= 4 && path[0].x === 0 && path[0].y === 0 && path[path.length - 1].x === 2 && path[path.length - 1].y === 2) {
            results.push({ name: 'A* direct route on open grid', pass: true });
        } else {
            results.push({ name: 'A* direct route on open grid', pass: false, error: 'Path invalid or not found' });
        }
    } catch (e) {
        results.push({ name: 'A* direct route on open grid', pass: false, error: e.message });
    }

    // Test 3: Wall navigation (must route around wall)
    try {
        const grid = [
            [0, 1, 0],
            [0, 1, 0],
            [0, 0, 0]
        ];
        const astar = new AStar(grid);
        const path = astar.findPath({ x: 0, y: 0 }, { x: 2, y: 0 });
        // Must go down to (0,2), across to (2,2), then up to (2,0)
        let hitWall = false;
        if (path) {
            for (const pt of path) {
                if (grid[pt.y][pt.x] === 1) hitWall = true;
            }
        }
        if (path && !hitWall && path[path.length - 1].x === 2 && path[path.length - 1].y === 0) {
            results.push({ name: 'A* routes around wall obstacles', pass: true });
        } else {
            results.push({ name: 'A* routes around wall obstacles', pass: false, error: `Path hit wall or failed: ${hitWall}` });
        }
    } catch (e) {
        results.push({ name: 'A* routes around wall obstacles', pass: false, error: e.message });
    }

    // Test 4: Unreachable target returns null
    try {
        const grid = [
            [0, 1, 0],
            [1, 1, 0],
            [0, 0, 0]
        ];
        const astar = new AStar(grid);
        // (0,0) is trapped by walls at (0,1) and (1,0)
        const path = astar.findPath({ x: 0, y: 0 }, { x: 2, y: 2 });
        if (path === null) {
            results.push({ name: 'A* safely returns null for unreachable goal', pass: true });
        } else {
            results.push({ name: 'A* safely returns null for unreachable goal', pass: false, error: 'Expected null' });
        }
    } catch (e) {
        results.push({ name: 'A* safely returns null for unreachable goal', pass: false, error: e.message });
    }

    // Test 5: Out of bounds / invalid start or end
    try {
        const grid = [
            [0, 0],
            [0, 0]
        ];
        const astar = new AStar(grid);
        const path1 = astar.findPath({ x: -1, y: 0 }, { x: 1, y: 1 });
        const path2 = astar.findPath({ x: 0, y: 0 }, { x: 5, y: 5 });
        if (path1 === null && path2 === null) {
            results.push({ name: 'A* handles out-of-bounds coordinates safely', pass: true });
        } else {
            results.push({ name: 'A* handles out-of-bounds coordinates safely', pass: false, error: 'Did not reject out-of-bounds' });
        }
    } catch (e) {
        results.push({ name: 'A* handles out-of-bounds coordinates safely', pass: false, error: e.message });
    }

    return results;
}
