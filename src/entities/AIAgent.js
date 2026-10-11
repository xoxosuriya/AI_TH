// AI Agent entity - autonomous character with AI capabilities
import { Entity } from './Entity.js';
import { CONFIG } from '../config.js';
import { StateMachine } from '../ai/StateMachine.js';
import { Perception } from '../ai/Perception.js';
import { UtilityTargetSelector } from '../ai/UtilityTargetSelector.js';
import { Steering } from '../ai/Steering.js';
import { CompetitionModel } from '../ai/CompetitionModel.js';
import { particles } from '../rendering/ParticleSystem.js';

export class AIAgent extends Entity {
    constructor(x, y, agentId, options = {}) {
        super(x, y, 'agent', {
            radius: 15, // Slightly smaller than player
            maxSpeed: options.speed || 100, // Will be set by difficulty
            maxForce: options.force || 15, // Slightly higher than player for maneuverability
            color: options.color || '#FF6B6B',
            agentId: agentId,
            ...options
        });
        
        // AI-specific properties
        this.agentId = agentId;
        this.difficulty = options.difficulty || 'medium';
        
        // AI systems
        this.stateMachine = new StateMachine();
        this.perception = new Perception({
            radius: CONFIG.DIFFICULTIES[this.difficulty].perceptionRadius,
            memoryDuration: 1500 // Shorter memory for agents
        });
        this.perception.setSelfId(this.agentId);
        
        this.targetSelector = new UtilityTargetSelector();
        this.steering = new Steering();
        this.competitionModel = new CompetitionModel();
        
        // AI state tracking
        this.currentTarget = null; // The treasure we're currently targeting
        this.currentPath = null;   // A* path to current target
        this.pathIndex = 0;        // Current waypoint index in path
        this.utilityScore = 0;     // Utility of current target
        this.decisionTimer = 0;    // Timer for decision making
        this.decisionInterval = CONFIG.DIFFICULTIES[this.difficulty].decisionInterval; // ms
        this.stuckTimer = 0;       // Timer for stuck detection
        this.lastMeaningfulPosition = { x: x, y: y }; // For stuck detection
        
        // Visual enhancements
        this.nameLabel = `AI-${this.agentId}`;
        this.stateColor = this._getStateColor();
        this.direction = { x: 0, y: 1 };
        this.score = 0;
        
        // Initialize state machine
        this.stateMachine.changeState('idle');
    }
    
    // Collect treasure and add points
    collectTreasure(treasure) {
        if (!treasure) return 0;
        const pts = treasure.value || 10;
        this.score += pts;
        this.currentTarget = null;
        this.currentPath = null;
        return pts;
    }
    
    // Update AI agent state
    update(deltaTime, gameState, obstacleEntities, entityManager) {
        // Store previous position for collision and stuck detection
        this.previousPosition = { x: this.position.x, y: this.position.y };
        
        // Update timers
        this.decisionTimer += deltaTime * 1000; // Convert to milliseconds
        this.stuckTimer += deltaTime * 1000;
        
        // Update perception
        const allEntities = entityManager.getAllEntities();
        this.perception.update(
            { 
                position: this.position,
                agentId: this.agentId
            },
            allEntities,
            gameState.time
        );
        
        // Update competition model
        this.competitionModel.update(
            this,
            this.perception.getPerceivedAgents(),
            gameState
        );
        
        // AI decision making (based on difficulty interval)
        if (this.decisionTimer >= this.decisionInterval) {
            this._makeDecision(gameState, entityManager);
            this.decisionTimer = 0;
        }
        
        // Check if stuck (not moving significantly for too long)
        this._checkStuck(deltaTime);
        
        // Update state machine based on current conditions
        this._updateStateMachine(gameState, entityManager);
        
        // Apply steering based on current state and target
        this._applySteering(deltaTime, gameState, entityManager);
        
        // Call parent update (applies physics)
        super.update(deltaTime);
        
        // Update visual properties based on state
        this._updateVisuals();
    }
    
    // Make AI decision: perceive, select target, plan path
    _makeDecision(gameState, entityManager) {
        // Get perceived treasures
        const perceivedTreasures = this.perception.getPerceivedTreasures();
        const perceivedAgents = this.perception.getPerceivedAgents();
        const perceivedPlayer = this.perception.getPerceivedPlayer();
        
        // If we have a current target, check if it's still valid
        if (this.currentTarget) {
            const targetStillValid = perceivedTreasures.some(t => t.id === this.currentTarget.id);
            if (!targetStillValid || this.currentTarget.collected) {
                // Target is gone or collected, need to select new target
                this.currentTarget = null;
                this.currentPath = null;
                this.pathIndex = 0;
            }
        }
        
        // Select new target if needed
        if (!this.currentTarget && perceivedTreasures.length > 0) {
            const selectionResult = this.targetSelector.selectTarget(
                this,
                perceivedTreasures,
                perceivedAgents,
                perceivedPlayer,
                gameState
            );
            
            if (selectionResult.target) {
                this.currentTarget = selectionResult.target;
                this.utilityScore = selectionResult.utility;
                
                // Log decision for debugging (in a real implementation, this would go to a decision log)
                // console.log(AI- selected target: );
            }
        }
        
        // If we have a target, plan or update path
        if (this.currentTarget) {
            // Check if we need to replan path
            const needsReplan = 
                !this.currentPath || 
                this.pathIndex >= this.currentPath.length ||
                // Target moved significantly (shouldn't happen for treasures, but good practice)
                false;
                
            if (needsReplan) {
                this._planPathToTarget(gameState.mapManager);
            }
        }
    }
    
    // Plan path to current target using A*
    _planPathToTarget(mapManager) {
        if (!this.currentTarget || !mapManager) {
            this.currentPath = null;
            return;
        }
        
        // Convert world positions to grid coordinates
        const startGrid = mapManager.worldToGrid(this.position.x, this.position.y);
        const endGrid = mapManager.worldToGrid(
            this.currentTarget.position.x,
            this.currentTarget.position.y
        );
        
        // Validate grid positions
        if (startGrid === null || endGrid === null) {
            this.currentPath = null;
            return;
        }
        
        // Use A* to find path
        // Note: In a full implementation, we'd pass the walkability map to A*
        // For now, we'll simulate with a simple straight-line path if A* not fully integrated
        this.currentPath = this._calculateSimplePath(startGrid, endGrid, mapManager);
        this.pathIndex = 0;
    }
    
    // Simple path calculation (placeholder - would be replaced with actual A* integration)
    _calculateSimplePath(start, end, mapManager) {
        // This is a simplified version - in reality we'd use the A* class with the grid
        // For demonstration, we'll create a basic path avoiding obvious obstacles
        
        // Get walkable grid from map manager
        const walkableGrid = mapManager.getWalkableGrid();
        if (!walkableGrid) {
            // Fall back to straight line if no grid available
            return this._straightLinePath(start, end);
        }
        
        // TODO: Integrate actual A* here
        // For now, return straight line as placeholder
        return this._straightLinePath(start, end);
    }
    
    // Create a straight line path (Bresenham's line algorithm simplified)
    _straightLinePath(start, end) {
        const path = [];
        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);
        const sx = start.x < end.x ? 1 : -1;
        const sy = start.y < end.y ? 1 : -1;
        let err = dx - dy;
        
        let x = start.x;
        let y = start.y;
        
        while (true) {
            path.push({ x, y });
            
            if (x === end.x && y === end.y) {
                break;
            }
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
        
        return path;
    }
    
    // Check if agent is stuck (not moving enough)
    _checkStuck(deltaTime) {
        const distanceMoved = this.distanceTo({
            x: this.lastMeaningfulPosition.x,
            y: this.lastMeaningfulPosition.y
        });
        
        // If we've moved less than 5 pixels in the last second, consider stuck
        if (distanceMoved < 5 && this.stuckTimer > 1000) {
            // Enter replanning state if we have a target
            if (this.currentTarget && !this.collected) {
                this.stateMachine.changeState('replanning');
                this.stuckTimer = 0; // Reset stick timer
                this.lastMeaningfulPosition = { x: this.position.x, y: this.position.y };
            }
        } else if (distanceMoved >= 5) {
            // Reset stuck timer if we moved meaningfully
            this.lastMeaningfulPosition = { x: this.position.x, y: this.position.y };
            this.stuckTimer = 0;
        }
    }
    
    // Update state machine based on game conditions
    _updateStateMachine(gameState, entityManager) {
        let newState = this.stateMachine.getCurrentState();
        
        switch (this.stateMachine.getCurrentState()) {
            case 'idle':
                // Start with a brief idle period at level start
                if (this.stateMachine.getTimeInCurrentState() > 500) { // 500ms idle
                    if (this.perception.getPerceivedTreasures().length > 0) {
                        newState = 'searching';
                    }
                }
                break;
                
            case 'searching':
                // Look for targets
                if (this.currentTarget) {
                    newState = 'targeting';
                }
                break;
                
            case 'targeting':
                // Evaluate utilities and select target (done in _makeDecision)
                if (this.currentTarget) {
                    newState = 'pathfinding';
                } else {
                    newState = 'searching'; // Keep looking
                }
                break;
                
            case 'pathfinding':
                // Calculate path to target (done in _makeDecision)
                if (this.currentPath && this.currentPath.length > 0) {
                    newState = 'moving';
                    this.pathIndex = 0;
                } else {
                    // No path available, replan
                    newState = 'replanning';
                }
                break;
                
            case 'moving':
                // Follow path using steering
                if (!this.currentTarget || this.currentTarget.collected) {
                    newState = 'replanning'; // Target gone
                } else if (this._hasReachedCurrentWaypoint()) {
                    this.pathIndex++;
                    if (this.pathIndex >= this.currentPath.length) {
                        // Reached final waypoint - we should be at target
                        newState = 'collecting';
                    }
                }
                break;
                
            case 'collecting':
                // Check if we're close enough to collect
                if (this.currentTarget && 
                    this.distanceTo(this.currentTarget) < (this.radius + this.currentTarget.radius)) {
                    // Collection will be handled by entity manager/system
                    // Stay in collecting state briefly to show collection effect
                    if (this.stateMachine.getTimeInCurrentState() > 200) { // 200ms collection time
                        newState = 'searching'; // Look for next target
                    }
                } else {
                    // Target moved, replan
                    newState = 'replanning';
                }
                break;
                
            case 'replanning':
                // Replan when target changes or path becomes invalid
                if (this.stateMachine.getTimeInCurrentState() > 300) { // 300ms replanning time
                    if (this.currentTarget && !this.currentTarget.collected) {
                        newState = 'pathfinding'; // Try to get new path
                    } else {
                        newState = 'searching'; // Look for new target
                    }
                }
                break;
                
            case 'returning':
                // Optional state: return to exit after completing objective
                // Implementation would depend on game state
                if (this.stateMachine.getTimeInCurrentState() > 1000) {
                    newState = 'searching';
                }
                break;
                
            case 'finished':
                // Stop all AI processing
                break;
        }
        
        // Change state if needed
        if (newState !== this.stateMachine.getCurrentState()) {
            this.stateMachine.changeState(newState);
        }
    }
    
    // Check if we've reached the current waypoint in our path
    _hasReachedCurrentWaypoint() {
        if (!this.currentPath || this.pathIndex >= this.currentPath.length) {
            return false;
        }
        
        // Convert grid waypoint to world position
        // In a full implementation, we'd use mapManager.gridToWorld()
        // For now, approximate with tile size
        const waypoint = this.currentPath[this.pathIndex];
        const worldX = waypoint.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const worldY = waypoint.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        
        const distanceToWaypoint = this.distanceTo({ x: worldX, y: worldY });
        return distanceToWaypoint < CONFIG.TILE_SIZE * 0.3; // Within 30% of tile size
    }
    
    // Apply steering forces based on current state
    _applySteering(deltaTime, gameState, entityManager) {
        // Reset acceleration (force-based system)
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        
        const steeringBehaviors = {};
        
        switch (this.stateMachine.getCurrentState()) {
            case 'moving':
            case 'returning':
                // Follow path to target
                if (this.currentPath && this.pathIndex < this.currentPath.length) {
                    // Get current waypoint
                    const waypoint = this.currentPath[this.pathIndex];
                    const worldX = waypoint.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    const worldY = waypoint.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    
                    // Use arrive when close to waypoint, seek otherwise
                    const distanceToWaypoint = this.distanceTo({ x: worldX, y: worldY });
                    if (distanceToWaypoint < CONFIG.TILE_SIZE * 0.5) {
                        steeringBehaviors.arrive = { 
                            target: { x: worldX, y: worldY },
                            slowingDistance: CONFIG.TILE_SIZE * 0.5,
                            weight: this.steering.arriveWeight
                        };
                    } else {
                        steeringBehaviors.seek = { 
                            target: { x: worldX, y: worldY },
                            weight: this.steering.seekWeight
                        };
                    }
                }
                break;
                
            case 'collecting':
                // Move toward target for collection
                if (this.currentTarget) {
                    steeringBehaviors.arrive = { 
                        target: { 
                            x: this.currentTarget.position.x, 
                            y: this.currentTarget.position.y 
                        },
                        slowingDistance: this.radius + this.currentTarget.radius + 5,
                        weight: this.steering.arriveWeight
                    };
                }
                break;
                
            case 'searching':
            case 'targeting':
            case 'pathfinding':
            case 'replanning':
                // Minor movement or idle - could add wandering behavior here
                // For now, apply minimal steering to avoid complete stoppage
                break;
        }
        
        // Add obstacle avoidance (always active)
        const obstacles = entityManager.getObstacles();
        if (obstacles.length > 0) {
            steeringBehaviors.avoid = {
                obstacles: obstacles,
                weight: this.steering.avoidWeight
            };
        }
        
        // Add agent-to-agent avoidance (always active)
        const otherAgents = entityManager.getAIAgents().filter(a => a.agentId !== this.agentId);
        if (otherAgents.length > 0) {
            // Treat other agents as obstacles for avoidance
            const agentObstacles = otherAgents.map(agent => ({
                position: agent.position,
                radius: agent.radius
            }));
            
            if (steeringBehaviors.avoid) {
                // Combine with existing obstacles
                steeringBehaviors.avoid.obstacles = [...steeringBehaviors.avoid.obstacles, ...agentObstacles];
            } else {
                steeringBehaviors.avoid = {
                    obstacles: agentObstacles,
                    weight: this.steering.avoidWeight * 0.7 // Slightly lower weight for agent avoidance
                };
            }
        }
        
        // Combine steering behaviors
        if (Object.keys(steeringBehaviors).length > 0) {
            const totalForce = this.steering.combine(this, steeringBehaviors);
            this.applyForce(totalForce);
        }
    }
    
    // Update visual properties based on AI state
    _updateVisuals() {
        // Change color based on state for debugging
        const stateColors = {
            idle: '#888888',
            searching: '#FFFF00',
            targeting: '#00FFFF',
            pathfinding: '#00FF00',
            moving: '#FF00FF',
            avoiding: '#FF8800',
            collecting: '#00FF88',
            replanning: '#FF0088',
            returning: '#8800FF',
            finished: '#FFFFFF'
        };
        
        const currentState = this.stateMachine.getCurrentState();
        if (stateColors[currentState]) {
            this.color = stateColors[currentState];
        }
        
        // Pulse effect when collecting or has target
        if (this.currentTarget || this.stateMachine.isInState('collecting')) {
            const pulseSpeed = 3; // pulses per second
            const pulseAmount = 0.3; // 30% size variation
            const pulse = Math.sin(performance.now() * 0.001 * pulseSpeed) * pulseAmount + 1;
            // This would affect rendering in a full implementation
            // For now, we'll just note it
        }
    }
    
    // Get color based on current state (for debugging)
    _getStateColor() {
        const stateColors = {
            idle: '#888888',
            searching: '#FFFF00',
            targeting: '#00FFFF',
            pathfinding: '#00FF00',
            moving: '#FF00FF',
            avoiding: '#FF8800',
            collecting: '#00FF88',
            replanning: '#FF0088',
            returning: '#8800FF',
            finished: '#FFFFFF'
        };
        
        return stateColors[this.stateMachine.getCurrentState()] || '#FFFFFF';
    }
    
    // Handle collecting a treasure (called by entity manager/system)
    collectTreasure(treasure) {
        if (treasure && treasure.id === this.currentTarget.id && !treasure.collected) {
            treasure.collected = true;
            this.currentTarget = null;
            this.currentPath = null;
            this.pathIndex = 0;
            // Return to searching state after brief collection
            this.stateMachine.changeState('collecting');
            return treasure.value;
        }
        return 0;
    }
    
    // Render the AI agent with cybernetic chassis and dynamic state aura
    render(ctx, camera) {
        if (!this.visible) return;
        
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const screenRadius = this.radius * camera.scale;
        
        // Dynamic state aura color
        const stateColors = {
            idle: '#38BDF8',
            searching: '#A855F7',
            moving: '#F59E0B',
            returning: '#EF4444'
        };
        const currentState = this.stateMachine.getCurrentState() || 'idle';
        const auraColor = stateColors[currentState] || '#A855F7';
        
        // Ambient soft ground shadow
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y + screenRadius * 0.4);
        ctx.scale(1, 0.4);
        ctx.beginPath();
        ctx.arc(0, 0, screenRadius * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();
        ctx.restore();
        
        // Pulsing AI sensor halo
        const haloGrad = ctx.createRadialGradient(screenPos.x, screenPos.y, screenRadius * 0.5, screenPos.x, screenPos.y, screenRadius * 1.7);
        haloGrad.addColorStop(0, auraColor);
        haloGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.15)');
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, screenRadius * 1.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Cybernetic drone chassis
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
        const bodyGrad = ctx.createRadialGradient(screenPos.x - screenRadius * 0.3, screenPos.y - screenRadius * 0.3, 1, screenPos.x, screenPos.y, screenRadius);
        bodyGrad.addColorStop(0, '#CBD5E1');
        bodyGrad.addColorStop(0.3, '#64748B');
        bodyGrad.addColorStop(0.8, '#334155');
        bodyGrad.addColorStop(1, '#0F172A');
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        
        // Glowing sensor iris in center
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, screenRadius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = auraColor;
        ctx.fill();
        
        // Direction pointer (chevron)
        let drawDirection = this.direction || { x: 0, y: 1 };
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > 10) {
            drawDirection = { x: this.velocity.x / speed, y: this.velocity.y / speed };
            this.direction = drawDirection;
        }
        
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        const angle = Math.atan2(drawDirection.y, drawDirection.x);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(screenRadius * 0.9, 0);
        ctx.lineTo(screenRadius * 0.15, -screenRadius * 0.4);
        ctx.lineTo(screenRadius * 0.3, 0);
        ctx.lineTo(screenRadius * 0.15, screenRadius * 0.4);
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.restore();
        
        // Name and state pill badge
        ctx.save();
        const labelY = screenPos.y - screenRadius - 8 * camera.scale;
        ctx.font = `bold ${Math.max(10, Math.round(11 * camera.scale))}px Outfit, Arial`;
        const textWidth = ctx.measureText(this.nameLabel).width;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(screenPos.x - textWidth / 2 - 5 * camera.scale, labelY - 10 * camera.scale, textWidth + 10 * camera.scale, 14 * camera.scale, 4 * camera.scale);
        ctx.fill();
        ctx.strokeStyle = auraColor;
        ctx.lineWidth = 1 * camera.scale;
        ctx.stroke();
        
        ctx.fillStyle = auraColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.nameLabel, screenPos.x, labelY - 3 * camera.scale);
        ctx.restore();
    }
    
    // Render debug info (state, target, path, etc.)
    renderDebug(ctx, camera) {
        super.renderDebug(ctx, camera);
        
        if (!this.visible) return;
        
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        
        // Draw state label
        ctx.fillStyle = '#00FF00';
        ctx.font = `${Math.round(10 * camera.scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(this.stateMachine.getCurrentState().toUpperCase(), screenPos.x, screenPos.y + screenRadius + 2 * camera.scale);
        
        // Draw target indicator if we have one
        if (this.currentTarget) {
            const targetScreenPos = camera.worldToScreen(
                this.currentTarget.position.x,
                this.currentTarget.position.y
            );
            
            // Dashed line to target
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 1 * camera.scale;
            ctx.setLineDash([5 * camera.scale, 3 * camera.scale]);
            ctx.beginPath();
            ctx.moveTo(screenPos.x, screenPos.y);
            ctx.lineTo(targetScreenPos.x, targetScreenPos.y);
            ctx.stroke();
            ctx.setLineDash([]); // Reset dash
            
            // Target ring
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2 * camera.scale;
            ctx.beginPath();
            ctx.arc(targetScreenPos.x, targetScreenPos.y, (this.radius + this.currentTarget.radius) * camera.scale, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw path if we have one
        if (this.currentPath && this.currentPath.length > 0) {
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2 * camera.scale;
            ctx.beginPath();
            
            // Convert first waypoint to world coordinates
            const first = this.currentPath[0];
            const firstWorldX = first.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const firstWorldY = first.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const firstScreen = camera.worldToScreen(firstWorldX, firstWorldY);
            ctx.moveTo(firstScreen.x, firstScreen.y);
            
            // Draw lines between waypoints
            for (let i = 1; i < this.currentPath.length; i++) {
                const point = this.currentPath[i];
                const worldX = point.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const worldY = point.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const screenPoint = camera.worldToScreen(worldX, worldY);
                ctx.lineTo(screenPoint.x, screenPoint.y);
            }
            
            ctx.stroke();
            
            // Draw waypoint dots
            ctx.fillStyle = '#00FF00';
            for (let i = 0; i < this.currentPath.length; i++) {
                const point = this.currentPath[i];
                const worldX = point.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const worldY = point.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const screenPoint = camera.worldToScreen(worldX, worldY);
                ctx.beginPath();
                ctx.arc(screenPoint.x, screenPoint.y, 3 * camera.scale, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Highlight current waypoint
            if (this.pathIndex < this.currentPath.length) {
                const current = this.currentPath[this.pathIndex];
                const worldX = current.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const worldY = current.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                const screenPoint = camera.worldToScreen(worldX, worldY);
                ctx.fillStyle = '#FFFF00';
                ctx.beginPath();
                ctx.arc(screenPoint.x, screenPoint.y, 5 * camera.scale, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw perception circle
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = 1 * camera.scale;
        ctx.setLineDash([2 * camera.scale, 2 * camera.scale]);
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, this.perception.radius * CONFIG.TILE_SIZE * camera.scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw utility score if we have a target
        if (this.currentTarget) {
            ctx.fillStyle = '#FFFF00';
            ctx.font = `${Math.round(12 * camera.scale)}px Arial`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`U: ${Math.round(this.utilityScore)}`, screenPos.x + screenRadius + 5 * camera.scale, screenPos.y - screenRadius);
        }
    }
    
    // Reset AI agent for level restart
    reset(startX, startY) {
        this.position.x = startX;
        this.position.y = startY;
        this.previousPosition.x = startX;
        this.previousPosition.y = startY;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        
        // Reset AI state
        this.stateMachine.reset();
        this.stateMachine.changeState('idle');
        
        this.currentTarget = null;
        this.currentPath = null;
        this.pathIndex = 0;
        this.utilityScore = 0;
        this.decisionTimer = 0;
        this.stuckTimer = 0;
        this.lastMeaningfulPosition = { x: startX, y: startY };
        
        // Reset perception and competition models
        this.perception = new Perception({
            radius: CONFIG.DIFFICULTIES[this.difficulty].perceptionRadius,
            memoryDuration: 1500
        });
        this.perception.setSelfId(this.agentId);
        
        this.competitionModel = new CompetitionModel();
        
        this.active = true;
        this.visible = true;
    }
}

