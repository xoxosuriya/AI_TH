// A* Pathfinding implementation with binary min-heap priority queue
import { PriorityQueue } from './PriorityQueue.js';

export class AStar {
    constructor(grid, walkableValue = 0) {
        this.grid = grid;
        this.width = grid[0].length;
        this.height = grid.length;
        this.walkableValue = walkableValue;
    }
    
    // Heuristic function - Manhattan distance
    _heuristic(posA, posB) {
        return Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y);
    }
    
    // Get valid neighbors (4-directional: up, right, down, left)
    _getNeighbors(node) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 1, y: 0 },  // right
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }  // left
        ];
        
        for (const dir of directions) {
            const newX = node.x + dir.x;
            const newY = node.y + dir.y;
            
            // Check bounds
            if (newX < 0 || newX >= this.width || newY < 0 || newY >= this.height) {
                continue;
            }
            
            // Check if walkable
            if (this.grid[newY][newX] === this.walkableValue) {
                neighbors.push({ x: newX, y: newY });
            }
        }
        
        return neighbors;
    }
    
    // Find path from start to end using A*
    findPath(start, end) {
        // Validate start and end positions
        if (start.x < 0 || start.x >= this.width || start.y < 0 || start.y >= this.height) {
            return null;
        }
        if (end.x < 0 || end.x >= this.width || end.y < 0 || end.y >= this.height) {
            return null;
        }
        if (this.grid[start.y][start.x] !== this.walkableValue) {
            return null;
        }
        if (this.grid[end.y][end.x] !== this.walkableValue) {
            return null;
        }
        
        const openSet = new PriorityQueue();
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map(); // Cost from start to current
        const fScore = new Map(); // Estimated total cost from start to goal
        
        // Initialize
        const startKey = `${start.x},${start.y}`;
        const endKey = `${end.x},${end.y}`;
        
        gScore.set(startKey, 0);
        fScore.set(startKey, this._heuristic(start, end));
        openSet.enqueue({ x: start.x, y: start.y }, fScore.get(startKey));
        
        while (!openSet.isEmpty()) {
            const current = openSet.dequeue();
            const currentKey = `${current.x},${current.y}`;
            
            if (currentKey === endKey) {
                // Found the path, reconstruct it
                return this._reconstructPath(cameFrom, currentKey);
            }
            
            closedSet.add(currentKey);
            
            const neighbors = this._getNeighbors(current);
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                
                if (closedSet.has(neighborKey)) {
                    continue; // Already evaluated
                }
                
                const tentativeGScore = gScore.get(currentKey) + 1; // Assuming uniform cost of 1
                
                // If we haven't seen this neighbor yet or we found a better path
                if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
                    cameFrom.set(neighborKey, currentKey);
                    gScore.set(neighborKey, tentativeGScore);
                    const fScoreValue = tentativeGScore + this._heuristic(neighbor, end);
                    fScore.set(neighborKey, fScoreValue);
                    
                    if (!openSet.heap.some(node => node.item.x === neighbor.x && node.item.y === neighbor.y)) {
                        openSet.enqueue(neighbor, fScoreValue);
                    }
                }
            }
        }
        
        // No path found
        return null;
    }
    
    // Reconstruct path from cameFrom map
    _reconstructPath(cameFrom, currentKey) {
        const path = [];
        let current = currentKey;
        
        while (cameFrom.has(current)) {
            const [x, y] = current.split(',').map(Number);
            path.unshift({ x, y }); // Add to front of array
            current = cameFrom.get(current);
        }
        
        // Add the start position
        const [startX, startY] = current.split(',').map(Number);
        path.unshift({ x: startX, y: startY });
        
        return path;
    }
    
    // Get path cost (number of steps)
    getPathCost(path) {
        return path ? path.length - 1 : 0; // Subtract 1 because cost is number of moves
    }
}

