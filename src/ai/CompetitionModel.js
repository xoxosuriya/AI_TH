// Competition modeling for AI agents - threat estimation based on proximity, approach vector & reservation
import { CONFIG } from '../config.js';

export class CompetitionModel {
    constructor() {
        // Target reservations: agentId -> { treasureId, timestamp }
        this.reservations = new Map();
        // Threat decay rate per second
        this.threatDecayRate = 0.5;
        // Reservation timeout (how long a reservation lasts without renewal)
        this.reservationTimeout = 5000; // 5 seconds
    }
    
    // Update competition model with current game state
    update(aiAgent, perceivedAgents, gameState) {
        // Clean expired reservations
        this._cleanExpiredReservations(gameState.time);
        
        // Update threat assessments for perceived agents
        this.threatAssessments = new Map();
        
        for (const agent of perceivedAgents) {
            const threat = this._estimateThreat(aiAgent, agent, gameState);
            this.threatAssessments.set(agent.id, threat);
        }
    }
    
    // Estimate threat from a specific competitor to our current target
    estimateThreatToTarget(competitor, ourTarget, gameState) {
        if (!ourTarget) {
            return 0; // No target = no threat
        }
        
        return this._estimateThreatToSpecificTarget(competitor, ourTarget, gameState);
    }
    
    // Estimate threat from competitor agent to our AI agent (general threat)
    estimateGeneralThreat(competitor, gameState) {
        if (!competitor) {
            return 0;
        }
        
        // Base threat on proximity and relative speed/aggressiveness
        const distance = this._distanceTo(competitor.position, gameState.selfPosition);
        const maxDistance = Math.sqrt(
            Math.pow(CONFIG.CANVAS_WIDTH, 2) + 
            Math.pow(CONFIG.CANVAS_HEIGHT, 2)
        );
        const normalizedDistance = distance / maxDistance;
        
        // Closer = higher threat
        proximityThreat = 1.0 - normalizedDistance;
        
        // Factor in competitor's apparent aggressiveness (speed, decision frequency)
        const speedFactor = competitor.speed / CONFIG.PLAYER.SPEED;
        const aggression = Math.min(1.0, speedFactor * 1.2); // Cap at 1.0
        
        // Combine factors
        return proximityThreat * 0.7 + aggression * 0.3;
    }
    
    // Reserve a target for this AI agent (soft reservation)
    reserveTarget(agentId, treasureId, timestamp) {
        this.reservations.set(treasureId, {
            agentId: agentId,
            timestamp: timestamp
        });
    }
    
    // Check if a target is reserved by another agent
    isReservedByOthers(treasureId, agentId) {
        const reservation = this.reservations.get(treasureId);
        return reservation && reservation.agentId !== agentId;
    }
    
    // Get reservation info for a target
    getReservation(treasureId) {
        return this.reservations.get(treasureId);
    }
    
    // Internal: Estimate threat from competitor to our target
    _estimateThreatToSpecificTarget(competitor, target, gameState) {
        if (!competitor.currentTarget || competitor.currentTarget.id !== target.id) {
            // Competitor is not targeting the same treasure = lower threat
            return this._estimateGeneralThreat(competitor, gameState) * 0.3;
        }
        
        // Competitor is targeting the same treasure
        // Threat based on:
        // 1. Proximity to target (closer = higher threat)
        // 2. Movement vector toward target
        // 3. Speed
        
        const competitorToTarget = this._distanceTo(competitor.position, target.position);
        const selfToTarget = this._distanceTo(gameState.selfPosition, target.position);
        
        // If competitor is closer, higher threat
        let proximityThreat = 0.5; // Base
        if (competitorToTarget < selfToTarget) {
            // Competitor is closer
            const closenessRatio = selfToTarget / Math.max(competitorToTarget, 1);
            proximityThreat = 0.5 + (0.5 * Math.min(closenessRatio - 1, 1)); // 0.5-1.0
        } else {
            // We are closer or equal
            const closenessRatio = competitorToTarget / Math.max(selfToTarget, 1);
            proximityThreat = 0.5 * closenessRatio; // 0-0.5
        }
        
        // Movement vector factor: are they moving toward the target?
        const movementFactor = this._calculateMovementTowardFactor(competitor, target);
        
        // Speed factor
        const speedFactor = Math.min(1.0, competitor.speed / (CONFIG.PLAYER.SPEED * 1.2));
        
        // Combine factors (weights can be tuned)
        return proximityThreat * 0.4 + 
               movementFactor * 0.4 + 
               speedFactor * 0.2;
    }
    
    // Calculate how much competitor is moving toward target (0-1)
    _calculateMovementTowardFactor(competitor, target) {
        if (!competitor.velocity || 
            competitor.velocity.x === 0 && 
            competitor.velocity.y === 0) {
            return 0.5; // Not moving = neutral
        }
        
        // Vector from competitor to target
        const toTargetX = target.position.x - competitor.position.x;
        const toTargetY = target.position.y - competitor.position.y;
        const toTargetLength = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
        
        if (toTargetLength === 0) {
            return 1.0; // Already at target
        }
        
        // Normalize the vector to target
        const toTargetNormX = toTargetX / toTargetLength;
        const toTargetNormY = toTargetY / toTargetLength;
        
        // Normalize competitor velocity
        const speed = Math.sqrt(
            competitor.velocity.x * competitor.velocity.x +
            competitor.velocity.y * competitor.velocity.y
        );
        
        if (speed === 0) {
            return 0.5; // Not moving
        }
        
        const velNormX = competitor.velocity.x / speed;
        const velNormY = competitor.velocity.y / speed;
        
        // Dot product gives cosine of angle between vectors
        const dotProduct = (velNormX * toTargetNormX) + (velNormY * toTargetNormY);
        
        // Convert from [-1,1] to [0,1] where 1 = moving directly toward target
        return (dotProduct + 1) / 2;
    }
    
    // Internal: Estimate general threat from competitor
    _estimateGeneralThreat(competitor, gameState) {
        if (!competitor) {
            return 0;
        }
        
        // Base threat on proximity and relative speed/aggressiveness
        const distance = this._distanceTo(competitor.position, gameState.selfPosition);
        const maxDistance = Math.sqrt(
            Math.pow(CONFIG.CANVAS_WIDTH, 2) + 
            Math.pow(CONFIG.CANVAS_HEIGHT, 2)
        );
        const normalizedDistance = distance / maxDistance;
        
        // Closer = higher threat
        proximityThreat = 1.0 - normalizedDistance;
        
        // Factor in competitor's apparent aggressiveness (speed, decision frequency)
        const speedFactor = competitor.speed / CONFIG.PLAYER.SPEED;
        const aggression = Math.min(1.0, speedFactor * 1.2); // Cap at 1.0
        
        // Combine factors
        return proximityThreat * 0.7 + aggression * 0.3;
    }
    
    // Clean expired reservations
    _cleanExpiredReservations(currentTime) {
        for (const [treasureId, reservation] of this.reservations.entries()) {
            if (currentTime - reservation.timestamp > this.reservationTimeout) {
                this.reservations.delete(treasureId);
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
    
    // Set reservation timeout (can change by difficulty)
    setReservationTimeout(timeoutMs) {
        this.reservationTimeout = timeoutMs;
    }
    
    // Get all current threats
    getThreatAssessments() {
        return [...this.threatAssessments.entries()];
    }
}

