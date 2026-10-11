// Perception system for AI agents - radius-limited sensing with short-term memory
import { CONFIG } from '../config.js';

export class Perception {
    constructor(options = {}) {
        this.radius = options.radius || CONFIG.DIFFICULTIES.MEDIUM.perceptionRadius; // tiles, default from medium difficulty
        this.memoryDuration = options.memoryDuration || 2000; // ms, how long to remember perceived objects
        this.memory = new Map(); // key -> { object, lastSeenTime }
    }
    
    // Update perception based on current game state
    update(aiPosition, gameObjects, currentTime) {
        // Clear expired memories
        this._clearExpiredMemories(currentTime);
        
        // Reset current perceptions
        this.currentPerceptions = {
            treasures: [],
            agents: [],
            player: null,
            exits: []
        };
        
        // Scan for objects within radius
        for (const obj of gameObjects) {
            const distance = this._distanceTo(aiPosition, obj.position);
            
            if (distance <= this.radius * CONFIG.TILE_SIZE) { // Convert tiles to pixels
                // Update memory with current sighting
                const memoryKey = obj.id || `${obj.type}__`;
                this.memory.set(memoryKey, {
                    object: obj,
                    lastSeenTime: currentTime
                });
                
                // Categorize by type
                switch (obj.type) {
                    case 'treasure':
                        this.currentPerceptions.treasures.push(obj);
                        break;
                    case 'agent':
                        // Don't include self
                        if (obj.id !== aiPosition.agentId) {
                            this.currentPerceptions.agents.push(obj);
                        }
                        break;
                    case 'player':
                        this.currentPerceptions.player = obj;
                        break;
                    case 'exit':
                        this.currentPerceptions.exits.push(obj);
                        break;
                }
            }
        }
    }
    
    // Get perceived treasures (from memory + current perception)
    getPerceivedTreasures() {
        // Return objects from memory that are still valid (not collected)
        return Array.from(this.memory.values())
            .filter(memoryObj => 
                memoryObj.object.type === 'treasure' && 
                !memoryObj.object.collected
            )
            .map(memoryObj => memoryObj.object);
    }
    
    // Get perceived agents (from memory + current perception)
    getPerceivedAgents(excludingSelf = true) {
        const agents = Array.from(this.memory.values())
            .filter(memoryObj => memoryObj.object.type === 'agent')
            .map(memoryObj => memoryObj.object);
            
        if (excludingSelf && this.selfId) {
            return agents.filter(agent => agent.id !== this.selfId);
        }
        return agents;
    }
    
    // Get perceived player (from memory + current perception)
    getPerceivedPlayer() {
        const playerMemories = Array.from(this.memory.values())
            .filter(memoryObj => memoryObj.object.type === 'player');
        return playerMemories.length > 0 ? playerMemories[0].object : null;
    }
    
    // Get perceived exits
    getPerceivedExits() {
        const exitMemories = Array.from(this.memory.values())
            .filter(memoryObj => memoryObj.object.type === 'exit');
        return exitMemories.map(memoryObj => memoryObj.object);
    }
    
    // Check if a specific treasure is perceived/remembered
    isTreasurePerceived(treasureId) {
        return this.memory.has(treasureId) && 
               !this.memory.get(treasureId).object.collected;
    }
    
    // Clear expired memories
    _clearExpiredMemories(currentTime) {
        for (const [key, memory] of this.memory.entries()) {
            if (currentTime - memory.lastSeenTime > this.memoryDuration) {
                this.memory.delete(key);
            }
        }
    }
    
    // Calculate distance between two positions
    _distanceTo(posA, posB) {
        return Math.sqrt(
            Math.pow(posA.x - posB.x, 2) +
            Math.pow(posA.y - posB.y, 2)
        );
    }
    
    // Set self ID for agent (to exclude self from perception)
    setSelfId(agentId) {
        this.selfId = agentId;
    }
    
    // Update perception radius (can change by difficulty)
    setRadius(radius) {
        this.radius = radius;
    }
}

