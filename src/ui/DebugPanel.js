// Debug panel for showing AI internal states (F1 debug mode)
export class DebugPanel {
    constructor() {
        // Panel state
        this.visible = false;
        this.width = 300;
        this.height = 400;
        
        // Debug info to display
        this.debugInfo = {
            gameState: {},
            player: {},
            aiAgents: [],
            systemStats: {
                fps: 0,
                updateTime: 0,
                renderTime: 0
            }
        };
        
        // Font settings
        this.fontSize = 12;
        this.lineHeight = 16;
        this.padding = 10;
        
        // Colors
        this.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.textColor = '#00FF00';
        this.highlightColor = '#FFFF00';
        this.accentColor = '#FF00FF';
    }
    
    // Set visibility
    setVisible(visible) {
        this.visible = visible;
    }
    
    // Toggle visibility
    toggle() {
        this.visible = !this.visible;
    }
    
    // Update debug info
    update(gameState) {
        if (!this.visible || !gameState) return;
        
        // Update game state info
        this.debugInfo.gameState = {
            time: gameState.time ? gameState.time.toFixed(1) : '0',
            levelTime: gameState.levelTime ? gameState.levelTime.toFixed(1) : '0',
            timeRemaining: gameState.timeRemaining ? gameState.timeRemaining.toFixed(1) : '0'
        };
        
        // Update player info
        if (gameState.player) {
            const p = gameState.player;
            this.debugInfo.player = {
                position: `(${p.position.x.toFixed(1)}, ${p.position.y.toFixed(1)})`,
                velocity: `(${p.velocity.x.toFixed(1)}, ${p.velocity.y.toFixed(1)})`,
                state: p.stateMachine ? p.stateMachine.getCurrentState() : 'active',
                target: p.currentTarget ? `T-${p.currentTarget.treasureType || ''}` : 'none',
                utility: p.utilityScore ? p.utilityScore.toFixed(3) : '0'
            };
        }
        
        // Update AI agents info
        this.debugInfo.aiAgents = [];
        if (gameState.aiAgents) {
            for (const agent of gameState.aiAgents) {
                const info = {
                    id: agent.agentId,
                    position: `(${agent.position.x.toFixed(1)}, ${agent.position.y.toFixed(1)})`,
                    velocity: `(${agent.velocity.x.toFixed(1)}, ${agent.velocity.y.toFixed(1)})`,
                    state: agent.stateMachine ? agent.stateMachine.getCurrentState() : 'unknown',
                    target: agent.currentTarget ? `T-${agent.currentTarget.treasureType || ''}` : 'none',
                    utility: agent.utilityScore ? agent.utilityScore.toFixed(3) : '0',
                    pathLength: agent.currentPath ? agent.currentPath.length : 0,
                    pathIndex: agent.pathIndex
                };
                this.debugInfo.aiAgents.push(info);
            }
        }
        
        // Update system stats (would be passed from game loop)
        // this.debugInfo.systemStats = {...};
    }
    
    // Render debug panel
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.visible) return;
        
        // Save context
        ctx.save();
        
        // Panel background and border
        ctx.fillStyle = this.backgroundColor;
        ctx.strokeStyle = this.highlightColor;
        ctx.lineWidth = 2;
        
        const x = this.padding;
        const y = this.padding;
        ctx.fillRect(x, y, this.width, this.height);
        ctx.strokeRect(x, y, this.width, this.height);
        
        // Panel title
        ctx.fillStyle = this.highlightColor;
        ctx.font = 'bold ' + (this.fontSize + 2) + 'px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('AI DEBUG PANEL', x + this.padding, y + this.padding);
        
        // Content area
        let contentY = y + this.padding + this.lineHeight + 10;
        const contentX = x + this.padding;
        
        // Game state section
        ctx.fillStyle = this.accentColor;
        ctx.font = 'bold ' + this.fontSize + 'px monospace';
        ctx.fillText('GAME STATE', contentX, contentY);
        contentY += this.lineHeight + 5;
        
        ctx.fillStyle = this.textColor;
        ctx.font = this.fontSize + 'px monospace';
        ctx.fillText('Time: ' + this.debugInfo.gameState.time + 's', contentX, contentY);
        contentY += this.lineHeight;
        ctx.fillText('Level Time: ' + this.debugInfo.gameState.levelTime + 's', contentX, contentY);
        contentY += this.lineHeight;
        ctx.fillText('Time Remaining: ' + this.debugInfo.gameState.timeRemaining + 's', contentX, contentY);
        contentY += this.lineHeight * 2; // Extra space
        
        // Player section
        ctx.fillStyle = this.accentColor;
        ctx.fillText('PLAYER', contentX, contentY);
        contentY += this.lineHeight + 5;
        
        ctx.fillStyle = this.textColor;
        ctx.font = this.fontSize + 'px monospace';
        ctx.fillText('Position: ' + this.debugInfo.player.position, contentX, contentY);
        contentY += this.lineHeight;
        ctx.fillText('Velocity: ' + this.debugInfo.player.velocity, contentX, contentY);
        contentY += this.lineHeight;
        ctx.fillText('State: ' + this.debugInfo.player.state, contentX, contentY);
        contentY += this.lineHeight;
        ctx.fillText('Target: ' + this.debugInfo.player.target, contentX, contentY);
        contentY += this.lineHeight;
        ctx.fillText('Utility: ' + this.debugInfo.player.utility, contentX, contentY);
        contentY += this.lineHeight * 2; // Extra space
        
        // AI agents section
        ctx.fillStyle = this.accentColor;
        ctx.fillText('AI AGENTS (' + this.debugInfo.aiAgents.length + ')', contentX, contentY);
        contentY += this.lineHeight + 5;
        
        ctx.fillStyle = this.textColor;
        ctx.font = this.fontSize + 'px monospace';
        
        // Limit number of agents shown to prevent overflow
        const maxAgentsToShow = Math.floor((this.height - contentY - this.padding) / this.lineHeight) - 2;
        const agentsToShow = this.debugInfo.aiAgents.slice(0, maxAgentsToShow);
        
        for (const agent of agentsToShow) {
            ctx.fillText(`AI-${agent.id}: [${agent.state}] T:${agent.target} U:${agent.utility}`, contentX, contentY);
            contentY += this.lineHeight;
            
            // Show path info on second line
            ctx.fillText(`    Path: ${agent.pathIndex}/${agent.pathLength} V:${agent.velocity}`, contentX, contentY);
            contentY += this.lineHeight;
        }
        
        // Show overflow notice if needed
        if (this.debugInfo.aiAgents.length > maxAgentsToShow) {
            ctx.fillStyle = '#FF8800';
            ctx.fillText(`... and ${this.debugInfo.aiAgents.length - maxAgentsToShow} more`, contentX, contentY);
            contentY += this.lineHeight;
        }
        
        // System stats section
        contentY += 10;
        ctx.fillStyle = this.accentColor;
        ctx.fillText('SYSTEM STATS', contentX, contentY);
        contentY += this.lineHeight + 5;
        
        ctx.fillStyle = this.textColor;
        ctx.font = this.fontSize + 'px monospace';
        ctx.fillText('FPS: ' + this.debugInfo.systemStats.fps, contentX, contentY);
        contentY += this.lineHeight;
        ctx.fillText('Update: ' + this.debugInfo.systemStats.updateTime.toFixed(1) + 'ms', contentX, contentY);
        contentY += this.lineHeight;
        ctx.fillText('Render: ' + this.debugInfo.systemStats.renderTime.toFixed(1) + 'ms', contentX, contentY);
        
        // Instructions
        contentY = y + this.height - this.padding - 20;
        ctx.fillStyle = this.highlightColor;
        ctx.font = (this.fontSize - 2) + 'px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('F1: Toggle Debug | P: Pause | R: Restart', x + this.width / 2, contentY);
        
        // Restore context
        ctx.restore();
    }
}

