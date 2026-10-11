// Score system - handles scoring for players and AI agents
export class ScoreSystem {
    constructor() {
        this.playerScore = 0;
        this.playerTreasuresCollected = 0;
        this.aiScores = new Map(); // agentId -> { score, treasuresCollected }
        this.distanceTravelled = new Map(); // entityId -> distance
    }
    
    // Reset score system
    reset() {
        this.playerScore = 0;
        this.playerTreasuresCollected = 0;
        this.aiScores.clear();
        this.distanceTravelled.clear();
    }
    
    // Add points to player score
    addPlayerPoints(points) {
        this.playerScore += points;
        return this.playerScore;
    }
    
    // Add points to AI agent score
    addAIAgentPoints(agentId, points) {
        if (!this.aiScores.has(agentId)) {
            this.aiScores.set(agentId, { score: 0, treasuresCollected: 0 });
        }
        
        const agentData = this.aiScores.get(agentId);
        agentData.score += points;
        this.aiScores.set(agentId, agentData);
        
        return agentData.score;
    }
    
    // Increment player treasure count
    incrementPlayerTreasures() {
        this.playerTreasuresCollected++;
        return this.playerTreasuresCollected;
    }
    
    // Increment AI agent treasure count
    incrementAIAgentTreasures(agentId) {
        if (!this.aiScores.has(agentId)) {
            this.aiScores.set(agentId, { score: 0, treasuresCollected: 0 });
        }
        
        const agentData = this.aiScores.get(agentId);
        agentData.treasuresCollected++;
        this.aiScores.set(agentId, agentData);
        
        return agentData.treasuresCollected;
    }
    
    // Get player score
    getPlayerScore() {
        return this.playerScore;
    }
    
    // Get player treasure count
    getPlayerTreasuresCollected() {
        return this.playerTreasuresCollected;
    }
    
    // Get AI agent score
    getAIAgentScore(agentId) {
        const agentData = this.aiScores.get(agentId);
        return agentData ? agentData.score : 0;
    }
    
    // Get AI agent treasure count
    getAIAgentTreasuresCollected(agentId) {
        const agentData = this.aiScores.get(agentId);
        return agentData ? agentData.treasuresCollected : 0;
    }
    
    // Get all AI scores
    getAIScores() {
        return [...this.aiScores.entries()].map(([id, data]) => ({
            agentId: id,
            score: data.score,
            treasuresCollected: data.treasuresCollected
        }));
    }
    
    // Update distance travelled (called each frame)
    updateDistanceTravelled(entityId, distanceDelta) {
        if (!this.distanceTravelled.has(entityId)) {
            this.distanceTravelled.set(entityId, 0);
        }
        const currentDistance = this.distanceTravelled.get(entityId);
        this.distanceTravelled.set(entityId, currentDistance + distanceDelta);
    }
    
    // Get distance travelled for an entity
    getDistanceTravelled(entityId) {
        return this.distanceTravelled.get(entityId) || 0;
    }
    
    // TODO: Implement tie-breaking logic for final scoring
}

