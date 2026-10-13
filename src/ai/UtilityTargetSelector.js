// Utility-based target selection for AI agents
import { CONFIG } from '../config.js';

export class UtilityTargetSelector {
    constructor(weights = null) {
        // Default weights (medium difficulty)
        this.weights = weights || {
            value: 0.35,
            distance: 0.25,
            risk: 0.15,
            competition: 0.15,
            urgency: 0.10
        };
        
        // Validate weights sum to 1.0 (approximately)
        const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1.0) > 0.01) {
            console.warn('Utility weights do not sum to 1.0:', this.weights);
        }
    }
    
    // Select the best target based on utility function
    selectTarget(aiAgent, perceivedTreasures, perceivedAgents, perceivedPlayer, gameState) {
        if (!perceivedTreasures || perceivedTreasures.length === 0) {
            return null;
        }
        
        let bestTarget = null;
        let bestUtility = -Infinity;
        let bestBreakdown = null;
        
        // Calculate utility for each treasure
        for (const treasure of perceivedTreasures) {
            const utilityResult = this._calculateUtility(
                aiAgent, 
                treasure, 
                perceivedAgents, 
                perceivedPlayer, 
                gameState
            );
            
            if (utilityResult.utility > bestUtility) {
                bestUtility = utilityResult.utility;
                bestTarget = treasure;
                bestBreakdown = utilityResult;
            }
        }
        
        return {
            target: bestTarget,
            utility: bestUtility,
            breakdown: bestBreakdown
        };
    }
    
    // Calculate utility for a specific target
    _calculateUtility(aiAgent, treasure, perceivedAgents, perceivedPlayer, gameState) {
        // Normalize each factor between 0 and 1
        
        // Value score: treasure value / max possible treasure value
        const maxTreasureValue = Math.max(...Object.values(CONFIG.TREASURE_TYPES).map(t => t.value));
        const valueScore = treasure.value / maxTreasureValue;
        
        // Distance score: 1 / (1 + normalized path cost)
        // We'll use straight-line distance for now, path cost will be calculated elsewhere
        const distanceToTreasure = this._distanceTo(aiAgent.position, treasure.position);
        const maxPossibleDistance = Math.sqrt(
            Math.pow(CONFIG.CANVAS_WIDTH, 2) + 
            Math.pow(CONFIG.CANVAS_HEIGHT, 2)
        );
        const normalizedDistance = distanceToTreasure / maxPossibleDistance;
        const distanceScore = 1 / (1 + normalizedDistance);
        
        // Risk score: 1 - normalized risk (lower risk is better)
        // Risk based on path exposure to walls/danger (simplified)
        const riskScore = this._calculateRiskScore(aiAgent, treasure);
        
        // Competition score: 1 - competitor threat (lower threat is better)
        const competitionScore = this._calculateCompetitionScore(
            aiAgent, 
            treasure, 
            perceivedAgents
        );
        
        // Urgency score: based on remaining time and distance to target
        const urgencyScore = this._calculateUrgencyScore(
            aiAgent, 
            treasure, 
            gameState
        );
        
        // Calculate weighted utility
        const utility = 
            this.weights.value * valueScore +
            this.weights.distance * distanceScore +
            this.weights.risk * riskScore +
            this.weights.competition * competitionScore +
            this.weights.urgency * urgencyScore;
        
        return {
            utility,
            valueScore,
            distanceScore,
            riskScore,
            competitionScore,
            urgencyScore,
            weights: this.weights,
            reason: this._generateReason(
                treasure,
                valueScore,
                distanceScore,
                riskScore,
                competitionScore,
                urgencyScore
            )
        };
    }
    
    // Calculate risk score (simplified - based on path exposure)
    _calculateRiskScore(aiAgent, treasure) {
        // For now, return a moderate risk score
        // In a full implementation, this would analyze the path for dangers
        return 0.7; // 70% safe
    }
    
    // Calculate competition score based on threat from other agents
    _calculateCompetitionScore(aiAgent, treasure, perceivedAgents) {
        if (!perceivedAgents || perceivedAgents.length === 0) {
            return 1.0; // No competition = best score
        }
        
        let maxThreat = 0;
        
        for (const agent of perceivedAgents) {
            // Skip if agent doesn't have a target or target is different
            if (!agent.currentTarget || agent.currentTarget.id !== treasure.id) {
                continue;
            }
            
            // Calculate threat based on:
            // 1. Distance to same target (closer = higher threat)
            const agentToTreasureDist = this._distanceTo(agent.position, treasure.position);
            const aiToTreasureDist = this._distanceTo(aiAgent.position, treasure.position);
            
            // 2. Agent speed (faster = higher threat)
            const speedFactor = agent.speed / CONFIG.PLAYER.SPEED;
            
            // 3. Time advantage (if agent would get there first)
            const timeAdvantage = Math.max(0, (aiToTreasureDist - agentToTreasureDist) / agent.speed);
            
            // Combined threat (simplified)
            let threat = 0;
            if (agentToTreasureDist < aiToTreasureDist) {
                // Agent is closer to treasure
                threat = 0.7 + (0.3 * speedFactor); // 0.7-1.0 range
            } else {
                // We are closer or equal
                threat = 0.3 * (1 - speedFactor); // 0-0.3 range
            }
            
            if (threat > maxThreat) {
                maxThreat = threat;
            }
        }
        
        // Competition score is 1 - threat (so lower threat = higher score)
        return 1.0 - Math.min(maxThreat, 1.0);
    }
    
    // Calculate urgency score based on timer pressure
    _calculateUrgencyScore(aiAgent, treasure, gameState) {
        if (!gameState || !gameState.timeRemaining) {
            return 0.5; // Default medium urgency
        }
        
        const distanceToTreasure = this._distanceTo(aiAgent.position, treasure.position);
        const agentSpeed = aiAgent.speed || 100;
        const timeToReach = distanceToTreasure / agentSpeed; // seconds to reach at current speed
        
        // If we can reach it easily with plenty of time, low urgency
        // If we're running out of time, high urgency
        const timeRatio = timeToReach / gameState.timeRemaining;
        
        // Urgency score: 1 / (1 + timeRatio) 
        // When timeRatio is small (plenty of time) -> score near 1
        // When timeRatio is large (little time) -> score near 0
        return 1 / (1 + timeRatio);
    }
    
    // Generate human-readable reason for target selection
    _generateReason(treasure, valueScore, distanceScore, riskScore, competitionScore, urgencyScore) {
        const typeStr = treasure.type || treasure.treasureType || 'relic';
        const treasureName = typeStr.charAt(0).toUpperCase() + typeStr.slice(1);
        const value = treasure.value;
        
        // Determine dominant factors
        const factors = [
            { name: 'value', score: valueScore },
            { name: 'distance', score: distanceScore },
            { name: 'risk', score: riskScore },
            { name: 'competition', score: competitionScore },
            { name: 'urgency', score: urgencyScore }
        ];
        
        // Sort by score descending
        factors.sort((a, b) => b.score - a.score);
        
        const topFactor = factors[0];
        const secondFactor = factors[1];
        
        let reason = `${treasureName} (${value}pts)`;
        
        if (topFactor.name === 'value' && topFactor.score > 0.8) {
            reason += ', high value';
        } else if (topFactor.name === 'distance' && topFactor.score > 0.8) {
            reason += ', close distance';
        } else if (topFactor.name === 'urgency' && topFactor.score > 0.7) {
            reason += ', time pressure';
        }
        
        if (competitionScore < 0.4) {
            reason += ', high competition';
        } else if (competitionScore > 0.7) {
            reason += ', low competition';
        }
        
        if (riskScore < 0.3) {
            reason += ', high risk';
        } else if (riskScore > 0.7) {
            reason += ', low risk';
        }
        
        return reason;
    }
    
    // Calculate distance between two positions
    _distanceTo(posA, posB) {
        return Math.sqrt(
            Math.pow(posA.x - posB.x, 2) +
            Math.pow(posA.y - posB.y, 2)
        );
    }
    
    // Update weights (can change by difficulty)
    setWeights(weights) {
        this.weights = weights;
        
        // Validate weights sum to 1.0 (approximately)
        const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1.0) > 0.01) {
            console.warn('Utility weights do not sum to 1.0:', this.weights);
        }
    }
}

