// Map manager - handles level data, grid operations, and map rendering
export class MapManager {
    constructor() {
        // Grid data (2D array)
        this.grid = []; // y then x: grid[y][x]
        this.width = 0; // in tiles
        this.height = 0; // in tiles
        
        // Cached data for performance
        this._walkableGrid = null; // Boolean grid for pathfinding
        this._obstacles = []; // Obstacle entities for collision
        this._spawnPoints = {
            player: null,
            ai: [],
            treasure: [],
            exit: null
        };
    }
    
    // Load level data
    loadLevel(levelData) {
        // Clear existing data
        this.clear();
        
        // Set dimensions
        this.width = levelData.width || 20;
        this.height = levelData.height || 12;
        
        // Initialize grid
        this.grid = Array(this.height).fill().map(() => Array(this.width).fill(0));
        
        // Copy level data
        if (levelData.grid) {
            for (let y = 0; y < Math.min(this.height, levelData.grid.length); y++) {
                const row = levelData.grid[y];
                for (let x = 0; x < Math.min(this.width, row.length); x++) {
                    this.grid[y][x] = row[x];
                }
            }
        }
        
        // Extract spawn points from level data or grid
        this._extractSpawnPoints(levelData);
        
        // Precompute walkable grid for pathfinding
        this._computeWalkableGrid();
        
        // Create obstacle entities from walls
        this._createObstacleEntities();
    }
    
    // Clear current level data
    clear() {
        this.grid = [];
        this.width = 0;
        this.height = 0;
        this._walkableGrid = null;
        this._obstacles = [];
        this._spawnPoints = {
            player: null,
            ai: [],
            treasure: [],
            exit: null
        };
    }
    
    // Extract spawn points from level data
    _extractSpawnPoints(levelData) {
        // Reset spawn points
        this._spawnPoints = {
            player: null,
            ai: [],
            treasure: [],
            exit: null
        };
        
        // First, check if explicit spawn data is provided
        if (levelData.playerSpawn) {
            this._spawnPoints.player = { ...levelData.playerSpawn };
        }
        if (levelData.aiSpawns) {
            this._spawnPoints.ai = [...levelData.aiSpawns];
        }
        if (levelData.treasureSpawns) {
            this._spawnPoints.treasure = [...levelData.treasureSpawns];
        }
        if (levelData.exitSpawn) {
            this._spawnPoints.exit = { ...levelData.exitSpawn };
        }
        
        // If no explicit data, scan the grid for special tiles
        if (!this._spawnPoints.player || 
            this._spawnPoints.ai.length === 0 ||
            this._spawnPoints.treasure.length === 0 ||
            !this._spawnPoints.exit) {
            
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const tileValue = this.grid[y][x];
                    
                    switch (tileValue) {
                        case 2: // PLAYER_SPAWN
                            if (!this._spawnPoints.player) {
                                this._spawnPoints.player = { x, y };
                            }
                            break;
                        case 3: // AI_SPAWN
                            this._spawnPoints.ai.push({ x, y });
                            break;
                        case 4: // TREASURE
                            this._spawnPoints.treasure.push({ x, y, type: 'coin' }); // Default to coin
                            break;
                        case 5: // EXIT
                            if (!this._spawnPoints.exit) {
                                this._spawnPoints.exit = { x, y };
                            }
                            break;
                    }
                }
            }
        }
    }
    
    // Precompute walkable grid for pathfinding (true = walkable)
    _computeWalkableGrid() {
        this._walkableGrid = Array(this.height);
        for (let y = 0; y < this.height; y++) {
            this._walkableGrid[y] = Array(this.width);
            for (let x = 0; x < this.width; x++) {
                // Walkable if not a wall (value 1)
                this._walkableGrid[y][x] = (this.grid[y][x] !== 1);
            }
        }
    }
    
    // Create obstacle entities from wall tiles
    _createObstacleEntities() {
        this._obstacles = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === 1) { // Wall
                    // Create obstacle entity at tile center
                    const obstacle = {
                        x: x * 64 + 32, // Assuming 64px tiles
                        y: y * 64 + 32,
                        radius: 30, // Slightly smaller than tile
                        type: 'wall'
                    };
                    this._obstacles.push(obstacle);
                }
            }
        }
    }
    
    // Get walkable grid (for pathfinding)
    getWalkableGrid() {
        return this._walkableGrid;
    }
    
    // Check if a world position is walkable
    isWalkable(worldX, worldY) {
        const gridX = Math.floor(worldX / 64); // 64px tiles
        const gridY = Math.floor(worldY / 64);
        
        // Check bounds
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return false;
        }
        
        return this._walkableGrid[gridY][gridX];
    }
    
    // Convert world coordinates to grid coordinates
    worldToGrid(worldX, worldY) {
        const gridX = Math.floor(worldX / 64);
        const gridY = Math.floor(worldY / 64);
        
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return null; // Out of bounds
        }
        
        return { x: gridX, y: gridY };
    }
    
    // Convert grid coordinates to world coordinates (returns center of tile)
    gridToWorld(gridX, gridY) {
        if (gridX < 0 || gridX >= this.width || gridY < 0 || gridY >= this.height) {
            return null; // Out of bounds
        }
        
        return {
            x: gridX * 64 + 32,
            y: gridY * 64 + 32
        };
    }
    
    // Get player spawn position
    getPlayerSpawn() {
        if (this._spawnPoints.player) {
            return { ...this._spawnPoints.player };
        }
        // Default to center if not specified
        return { 
            x: Math.floor(this.width / 2), 
            y: Math.floor(this.height / 2) 
        };
    }
    
    // Get AI spawn positions
    getAISpawns() {
        if (this._spawnPoints.ai.length > 0) {
            return [...this._spawnPoints.ai];
        }
        // Default to corners if not specified
        return [
            { x: 1, y: 1 },
            { x: this.width - 2, y: 1 },
            { x: 1, y: this.height - 2 },
            { x: this.width - 2, y: this.height - 2 }
        ].filter(pos => 
            pos.x >= 0 && pos.x < this.width && 
            pos.y >= 0 && pos.y < this.height
        );
    }
    
    // Get treasure spawn positions
    getTreasureSpawns() {
        return [...this._spawnPoints.treasure];
    }
    
    // Get exit spawn position
    getExitSpawn() {
        if (this._spawnPoints.exit) {
            return { ...this._spawnPoints.exit };
        }
        // Default to opposite corner from player
        const playerSpawn = this.getPlayerSpawn();
        return {
            x: Math.min(this.width - 1, Math.max(0, playerSpawn.x + 5)),
            y: Math.min(this.height - 1, Math.max(0, playerSpawn.y + 3))
        };
    }
    
    // Get obstacle entities (for collision detection)
    getObstacles() {
        return [...this._obstacles];
    }
    
    // Get level dimensions in pixels
    getPixelWidth() {
        return this.width * 64;
    }
    
    // Get level dimensions in pixels
    getPixelHeight() {
        return this.height * 64;
    }
    
    // Render the map (simple colored tiles for now)
    render(ctx, camera) {
        // Render floor tiles
        this._renderFloorTiles(ctx, camera);
        
        // Render wall tiles
        this._renderWallTiles(ctx, camera);
    }
    
    // Render floor tiles with rich paving textures, ambient shadows, and arcane rune inlays
    _renderFloorTiles(ctx, camera) {
        const topLeftWorld = camera.screenToWorld(0, 0);
        const bottomRightWorld = camera.screenToWorld(ctx.canvas.width, ctx.canvas.height);
        
        const startX = Math.max(0, Math.floor(topLeftWorld.x / 64) - 1);
        const startY = Math.max(0, Math.floor(topLeftWorld.y / 64) - 1);
        const endX = Math.min(this.width - 1, Math.floor(bottomRightWorld.x / 64) + 1);
        const endY = Math.min(this.height - 1, Math.floor(bottomRightWorld.y / 64) + 1);
        
        const scale = camera.scale;
        const tileSize = 64 * scale;
        
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                if (this.grid[y][x] === 1) continue; // Skip walls
                
                const screenPos = camera.worldToScreen(x * 64, y * 64);
                
                // Deterministic pseudo-random variation based on tile coordinates
                const seed = (x * 374761393 + y * 668265263) ^ 0x5DEECE66D;
                const variant = Math.abs(seed) % 4;
                
                // Rich temple stone palette
                const floorColors = ['#1B1F2A', '#1E2330', '#222736', '#1A1E28'];
                ctx.fillStyle = floorColors[variant];
                ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);
                
                // Inner slab bevel
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
                ctx.lineWidth = 1 * scale;
                ctx.strokeRect(screenPos.x + 2 * scale, screenPos.y + 2 * scale, tileSize - 4 * scale, tileSize - 4 * scale);
                
                // Deep mortar border
                ctx.strokeStyle = 'rgba(10, 12, 18, 0.7)';
                ctx.strokeRect(screenPos.x, screenPos.y, tileSize, tileSize);
                
                // Ancient golden rune inlay on select tiles
                if (Math.abs(seed) % 11 === 0) {
                    ctx.save();
                    ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
                    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
                    ctx.lineWidth = 1.5 * scale;
                    const cx = screenPos.x + tileSize / 2;
                    const cy = screenPos.y + tileSize / 2;
                    const r = 12 * scale;
                    
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    // Arcane diamond inside rune
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - r * 0.7);
                    ctx.lineTo(cx + r * 0.7, cy);
                    ctx.lineTo(cx, cy + r * 0.7);
                    ctx.lineTo(cx - r * 0.7, cy);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.restore();
                }
                
                // Ambient drop shadow from neighboring walls
                const hasNorthWall = y > 0 && this.grid[y - 1][x] === 1;
                const hasWestWall = x > 0 && this.grid[y][x - 1] === 1;
                
                if (hasNorthWall) {
                    const grad = ctx.createLinearGradient(screenPos.x, screenPos.y, screenPos.x, screenPos.y + 14 * scale);
                    grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
                    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = grad;
                    ctx.fillRect(screenPos.x, screenPos.y, tileSize, 14 * scale);
                }
                if (hasWestWall) {
                    const grad = ctx.createLinearGradient(screenPos.x, screenPos.y, screenPos.x + 14 * scale, screenPos.y);
                    grad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
                    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = grad;
                    ctx.fillRect(screenPos.x, screenPos.y, 14 * scale, tileSize);
                }
            }
        }
    }
    
    // Render wall tiles with 3D carved masonry blocks, bevels, and front drop-ledges
    _renderWallTiles(ctx, camera) {
        const topLeftWorld = camera.screenToWorld(0, 0);
        const bottomRightWorld = camera.screenToWorld(ctx.canvas.width, ctx.canvas.height);
        
        const startX = Math.max(0, Math.floor(topLeftWorld.x / 64) - 1);
        const startY = Math.max(0, Math.floor(topLeftWorld.y / 64) - 1);
        const endX = Math.min(this.width - 1, Math.floor(bottomRightWorld.x / 64) + 1);
        const endY = Math.min(this.height - 1, Math.floor(bottomRightWorld.y / 64) + 1);
        
        const scale = camera.scale;
        const tileSize = 64 * scale;
        
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                if (this.grid[y][x] !== 1) continue;
                
                const screenPos = camera.worldToScreen(x * 64, y * 64);
                const hasSouthFloor = y < this.height - 1 && this.grid[y + 1][x] !== 1;
                
                // Top wall surface (horizontal cap)
                ctx.fillStyle = '#3E4656';
                ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);
                
                // Brick sub-blocks pattern
                ctx.strokeStyle = 'rgba(15, 18, 26, 0.7)';
                ctx.lineWidth = 1.5 * scale;
                
                // Horizontal divider
                const midY = screenPos.y + tileSize / 2;
                ctx.beginPath();
                ctx.moveTo(screenPos.x, midY);
                ctx.lineTo(screenPos.x + tileSize, midY);
                ctx.stroke();
                
                // Staggered vertical joints
                const midX = screenPos.x + tileSize / 2;
                ctx.beginPath();
                ctx.moveTo(midX, screenPos.y);
                ctx.lineTo(midX, midY);
                ctx.moveTo(screenPos.x + tileSize * 0.25, midY);
                ctx.lineTo(screenPos.x + tileSize * 0.25, screenPos.y + tileSize);
                ctx.moveTo(screenPos.x + tileSize * 0.75, midY);
                ctx.lineTo(screenPos.x + tileSize * 0.75, screenPos.y + tileSize);
                ctx.stroke();
                
                // Top light bevel (bright edge reflection)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.fillRect(screenPos.x, screenPos.y, tileSize, 3 * scale);
                ctx.fillRect(screenPos.x, screenPos.y, 3 * scale, tileSize);
                
                // Bottom & right shadow edge
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fillRect(screenPos.x, screenPos.y + tileSize - 3 * scale, tileSize, 3 * scale);
                ctx.fillRect(screenPos.x + tileSize - 3 * scale, screenPos.y, 3 * scale, tileSize);
                
                // If facing open floor to south, add front 3D rim
                if (hasSouthFloor) {
                    ctx.fillStyle = '#282D38';
                    ctx.fillRect(screenPos.x, screenPos.y + tileSize - 8 * scale, tileSize, 8 * scale);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    ctx.fillRect(screenPos.x, screenPos.y + tileSize - 2 * scale, tileSize, 2 * scale);
                }
            }
        }
    }
}

