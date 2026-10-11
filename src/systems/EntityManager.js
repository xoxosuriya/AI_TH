// Entity manager - handles creation, updating, and lifecycle of all game entities

export class EntityManager {
    constructor() {
        this.entities = new Map(); // id -> entity
        this.entitiesByType = new Map(); // type -> Set of entities
        this.player = null;
        this.aiAgents = [];
        this.treasures = [];
        this.exit = null;
        this.obstacles = []; // Walls/impassable tiles
        
        // Factory methods will be set by the game during initialization
        this._entityFactories = {};
    }
    
    // Set entity factory methods (called by Game during initialization)
    setFactories(factories) {
        this._entityFactories = factories;
    }
    
    // Clear all entities
    clear() {
        this.entities.clear();
        this.entitiesByType.clear();
        this.player = null;
        this.aiAgents = [];
        this.treasures = [];
        this.exit = null;
        this.obstacles = [];
    }
    
    // Create a player entity
    createPlayer(x, y, options = {}) {
        if (!this._entityFactories.player) {
            throw new Error('Player factory not set');
        }
        const entity = this._entityFactories.player(x, y, options);
        this._addEntity(entity);
        this.player = entity;
        return entity;
    }
    
    // Create an AI agent entity
    createAIAgent(x, y, agentId, options = {}) {
        if (!this._entityFactories.agent) {
            throw new Error('Agent factory not set');
        }
        const entity = this._entityFactories.agent(x, y, agentId, options);
        this._addEntity(entity);
        this.aiAgents.push(entity);
        return entity;
    }
    
    // Create a treasure entity
    createTreasure(x, y, type, options = {}) {
        if (!this._entityFactories.treasure) {
            throw new Error('Treasure factory not set');
        }
        const entity = this._entityFactories.treasure(x, y, type, options);
        this._addEntity(entity);
        this.treasures.push(entity);
        return entity;
    }
    
    // Create an exit entity
    createExit(x, y, options = {}) {
        if (!this._entityFactories.exit) {
            throw new Error('Exit factory not set');
        }
        const entity = this._entityFactories.exit(x, y, options);
        this._addEntity(entity);
        this.exit = entity;
        return entity;
    }
    
    // Create an obstacle (wall) entity
    createObstacle(x, y, options = {}) {
        if (!this._entityFactories.obstacle) {
            throw new Error('Obstacle factory not set');
        }
        const entity = this._entityFactories.obstacle(x, y, options);
        this._addEntity(entity);
        this.obstacles.push(entity);
        return entity;
    }
    
    // Internal: Add entity to tracking systems
    _addEntity(entity) {
        this.entities.set(entity.id, entity);
        
        // Add to type-specific tracking
        let typeSet = this.entitiesByType.get(entity.type);
        if (!typeSet) {
            typeSet = new Set();
            this.entitiesByType.set(entity.type, typeSet);
        }
        typeSet.add(entity);
    }
    
    // Internal: Remove entity from tracking systems
    _removeEntity(entity) {
        this.entities.delete(entity.id);
        
        // Remove from type-specific tracking
        const typeSet = this.entitiesByType.get(entity.type);
        if (typeSet) {
            typeSet.delete(entity);
            if (typeSet.size === 0) {
                this.entitiesByType.delete(entity.type);
            }
        }
        
        // Remove from specific tracking arrays
        if (entity === this.player) {
            this.player = null;
        }
        
        const agentIndex = this.aiAgents.indexOf(entity);
        if (agentIndex !== -1) {
            this.aiAgents.splice(agentIndex, 1);
        }
        
        const treasureIndex = this.treasures.indexOf(entity);
        if (treasureIndex !== -1) {
            this.treasures.splice(treasureIndex, 1);
        }
        
        if (entity === this.exit) {
            this.exit = null;
        }
        
        const obstacleIndex = this.obstacles.indexOf(entity);
        if (obstacleIndex !== -1) {
            this.obstacles.splice(obstacleIndex, 1);
        }
    }
    
    // Get all entities as an array
    getAllEntities() {
        return Array.from(this.entities.values());
    }
    
    // Update all entities
    update(deltaTime, gameState = { time: performance.now() }) {
        for (const entity of this.entities.values()) {
            if (entity.active) {
                if (entity.type === 'agent') {
                    entity.update(deltaTime, gameState, this.obstacles, this);
                } else if (entity.type === 'player') {
                    entity.update(deltaTime, null, this.obstacles);
                } else {
                    entity.update(deltaTime);
                }
            }
        }
        
        // Handle entity interactions (treasure collection, etc.)
        this._handleEntityInteractions();
    }
    
    // Handle entity interactions (treasure collection, etc.)
    _handleEntityInteractions() {
        // Check for player collecting treasures
        if (this.player && this.player.active) {
            for (const treasure of this.treasures) {
                if (treasure.active && !treasure.collected && this.player.overlaps(treasure)) {
                    // Player collects treasure
                    this.player.collectTreasure(treasure);
                    treasure.onCollected();
                    
                    // Notify score system (would be done through events in full implementation)
                    // this.scoreSystem.addPoints(treasure.value, 'player');
                }
            }
        }
        
        // Check for AI agents collecting treasures
        for (const agent of this.aiAgents) {
            if (agent.active && !agent.collected) {
                for (const treasure of this.treasures) {
                    if (treasure.active && !treasure.collected && agent.overlaps(treasure)) {
                        // AI agent collects treasure
                        const points = agent.collectTreasure(treasure);
                        treasure.onCollected();
                        
                        // Notify score system
                        // this.scoreSystem.addPoints(points, gent-);
                    }
                }
            }
        }
        
        // Remove collected treasures from active list after a delay
        // In a full implementation, this would be handled by a lifetime system
        for (let i = this.treasures.length - 1; i >= 0; i--) {
            const treasure = this.treasures[i];
            if (treasure.collected && treasure.floatTextTimer >= treasure.floatTextDuration) {
                this._removeEntity(treasure);
                this.treasures.splice(i, 1);
            }
        }
    }
    
    // Get entities by type
    getEntitiesByType(type) {
        const set = this.entitiesByType.get(type);
        return set ? [...set] : [];
    }
    
    // Get player entity
    getPlayer() {
        return this.player;
    }
    
    // Get AI agents
    getAIAgents() {
        return [...this.aiAgents]; // Return copy
    }
    
    // Get treasures
    getTreasures() {
        return [...this.treasures];
    }
    
    // Get exit
    getExit() {
        return this.exit;
    }
    
    // Get obstacles
    getObstacles() {
        return [...this.obstacles];
    }
    
    // Get all entities
    getAllEntities() {
        return [...this.entities.values()];
    }
    
    // Clear level entities (called when changing levels)
    clearLevelEntities() {
        // Keep persistent entities if any (none in this game)
        this.entities.clear();
        this.entitiesByType.clear();
        
        this.player = null;
        this.aiAgents = [];
        this.treasures = [];
        this.exit = null;
        this.obstacles = [];
    }
    
    // Reset entities for level start (positions, states, etc.)
    resetForLevelStart() {
        // Reset would typically be handled by each entity's reset method
        // which would be called by the game when setting up the level
        for (const entity of this.entities.values()) {
            if (typeof entity.reset === 'function') {
                // Reset would be called with level-specific parameters
                // For now, we'll just note that entities handle their own reset
            }
        }
    }
    
    // Destroy an entity
    destroyEntity(entity) {
        this._removeEntity(entity);
        entity.destroy();
    }
    
    // Render all managed entities
    renderAll(ctx, camera) {
        if (!ctx || !camera) return;
        
        // Render exit
        if (this.exit && typeof this.exit.render === 'function') {
            this.exit.render(ctx, camera);
        }
        
        // Render treasures
        for (const treasure of this.treasures) {
            if (typeof treasure.render === 'function') {
                treasure.render(ctx, camera);
            }
        }
        
        // Render AI agents
        for (const agent of this.aiAgents) {
            if (typeof agent.render === 'function') {
                agent.render(ctx, camera);
            }
        }
        
        // Render player on top
        if (this.player && typeof this.player.render === 'function') {
            this.player.render(ctx, camera);
        }
    }
}
