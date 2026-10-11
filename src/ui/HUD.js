// HUD (Heads-Up Display) for showing in-game information
export class HUD {
    constructor() {
        // HUD elements
        this.elements = {
            levelName: '',
            difficulty: '',
            timer: '0:00',
            playerScore: 0,
            objective: ''
        };
        
        // Animation timers
        this.pulseTimer = 0;
        this.flashTimer = 0;
        
        // Layout constants
        this.padding = 20;
        this.lineHeight = 25;
    }
    
    // Update HUD with game state
    update(gameState) {
        if (!gameState) return;
        
        // Update level info
        if (gameState.level) {
            this.elements.levelName = gameState.level.name || 'Unknown Level';
            this.elements.objective = 'Target: ' + (gameState.level.targetScore || 0) + ' pts';
        }
        
        // Update difficulty (would come from game state or UI manager)
        this.elements.difficulty = gameState.difficulty || 'Medium';
        
        // Update timer
        if (gameState.timeRemaining !== undefined) {
            const totalSeconds = Math.max(0, Math.floor(gameState.timeRemaining));
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = (totalSeconds % 60).toString().padStart(2, '0');
            this.elements.timer = minutes + ':' + seconds;
        }
        
        // Update player score
        if (gameState.scoreSystem) {
            this.elements.playerScore = gameState.scoreSystem.getPlayerScore() || 0;
        }
    }
    
    // Render HUD
    render(ctx, canvasWidth, canvasHeight) {
        // Save context state
        ctx.save();
        
        // Top-left: Level and objective info
        ctx.fillStyle = '#FFFF00';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        let y = this.padding;
        ctx.fillText('Level: ' + this.elements.levelName, this.padding, y);
        y += this.lineHeight;
        ctx.fillText(this.elements.objective, this.padding, y);
        
        // Top-center: Timer
        ctx.textAlign = 'center';
        ctx.fillText(this.elements.timer, canvasWidth / 2, this.padding);
        
        // Top-right: Player score
        ctx.textAlign = 'right';
        ctx.fillText('Score: ' + this.elements.playerScore, canvasWidth - this.padding, this.padding);
        
        // Right-side: Leaderboard (simplified placeholder)
        this._renderLeaderboard(ctx, canvasWidth, canvasHeight);
        
        // Bottom: Controls hint (would be shown conditionally)
        // ctx.fillStyle = '#FFFFFF';
        // ctx.font = '14px Arial';
        // ctx.textAlign = 'center';
        // ctx.fillText('WASD/Arrows: Move | P: Pause | R: Restart | M: Mute | F1: Debug', canvasWidth / 2, canvasHeight - this.padding);
        
        // Restore context
        ctx.restore();
    }
    
    // Render leaderboard placeholder
    _renderLeaderboard(ctx, canvasWidth, canvasHeight) {
        const startX = canvasWidth - 220;
        const startY = 80;
        const lineHeight = 22;
        
        ctx.fillStyle = '#FFFF00';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        ctx.fillText('LEADERBOARD', startX, startY);
        
        // Player entry
        ctx.fillStyle = '#4FC3F7'; // Player color
        ctx.fillText('YOU: ' + this.elements.playerScore, startX, startY + lineHeight);
        
        // AI entries (placeholder)
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText('AI-1: 0', startX, startY + lineHeight * 2);
        ctx.fillStyle = '#4ECDC4';
        ctx.fillText('AI-2: 0', startX, startY + lineHeight * 3);
        ctx.fillStyle = '#45B7D1';
        ctx.fillText('AI-3: 0', startX, startY + lineHeight * 4);
    }
    
    // Flash effect for score updates
    flashScore() {
        this.flashTimer = 500; // 0.5 seconds
    }
    
    // Pulse effect for timer warnings
    pulseTimerWarning() {
        this.pulseTimer = 3000; // 3 seconds
    }
    
    // Get pulse alpha for timer (0-1)
    getTimerPulseAlpha() {
        if (this.pulseTimer <= 0) return 1.0;
        const progress = this.pulseTimer / 3000;
        return 0.5 + 0.5 * Math.sin(progress * Math.PI * 2); // Pulse between 0.5 and 1.0
    }
    
    // Get flash alpha for score (0-1)
    getScoreFlashAlpha() {
        if (this.flashTimer <= 0) return 1.0;
        return this.flashTimer / 500; // Fade out over 0.5 seconds
    }
}

