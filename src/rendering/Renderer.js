// Main renderer - coordinates rendering of game world and UI
import { CONFIG } from '../config.js';

export class Renderer {
    constructor(game) {
        this.game = game;
        
        // Rendering systems
        this.effects = null; // Will be set by game
        this.mapManager = null; // Will be set by game
        this.entityManager = null; // Will be set by game
        this.uiManager = null; // Will be set by game
        this.assetLoader = null; // Will be set by game
        
        // Render settings
        this.renderDistance = 1000; // pixels
        this.debugRender = false;
        
        // Frame timing
        this.lastRenderTime = 0;
        this.renderTime = 0;
    }
    
    // Set rendering systems (called by game during initialization)
    setSystems(effects, mapManager, entityManager, uiManager, assetLoader) {
        this.effects = effects;
        this.mapManager = mapManager;
        this.entityManager = entityManager;
        this.uiManager = uiManager;
        this.assetLoader = assetLoader;
    }
    
    // Render the full game frame
    render() {
        const startTime = performance.now();
        
        const ctx = this.game.getCtx();
        const canvas = this.game.getCanvas();
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Render based on game state
        const state = this.game.getState();
        this._renderByState(ctx, canvas.width, canvas.height, state);
        
        // Render effects (particles, flashes, etc.)
        if (this.effects) {
            this.effects.update(this.game.getDeltaTime() / 1000); // Convert to seconds
            this.effects.render(ctx, this.game.getCamera());
        }
        
        // Render debug info if enabled
        if (this.debugRender || CONFIG.DEBUG.SHOW_GRID || CONFIG.DEBUG.SHOW_PATHS || CONFIG.DEBUG.SHOW_STATES) {
            this._renderDebugInfo(ctx, canvas.width, canvas.height);
        }
        
        // Calculate render time
        this.renderTime = performance.now() - startTime;
    }
    
    // Render based on game state
    _renderByState(ctx, width, height, state) {
        switch (state) {
            case CONFIG.GAME_STATES.BOOT:
                // Boot screen - show loading progress
                if (this.assetLoader) {
                    this.assetLoader.render(ctx, width, height);
                }
                break;
                
            case CONFIG.GAME_STATES.MENU:
            case CONFIG.GAME_STATES.DIFFICULTY_SELECT:
            case CONFIG.GAME_STATES.LEVEL_SELECT:
            case CONFIG.GAME_STATES.TUTORIAL:
            case CONFIG.GAME_STATES.HOW_AI_WORKS:
            case CONFIG.GAME_STATES.PAUSED:
            case CONFIG.GAME_STATES.LEVEL_COMPLETE:
            case CONFIG.GAME_STATES.LEVEL_FAILED:
            case CONFIG.GAME_STATES.GAME_COMPLETE:
                // UI screens
                if (this.uiManager) {
                    this.uiManager.render(ctx, width, height);
                }
                break;
                
            case CONFIG.GAME_STATES.LOADING_LEVEL:
                // Loading screen
                if (this.assetLoader) {
                    this.assetLoader.render(ctx, width, height);
                }
                // Show loading message
                if (this.uiManager) {
                    this.uiManager.renderLoading(ctx, width, height);
                }
                break;
                
            case CONFIG.GAME_STATES.COUNTDOWN:
            case CONFIG.GAME_STATES.PLAYING:
                // Render game world
                this._renderGameWorld(ctx, width, height);
                
                // Render UI/HUD
                if (this.uiManager) {
                    const gameState = this._getCurrentGameState();
                    this.uiManager.renderHUD(ctx, width, height, gameState);
                }
                break;
        }
    }
    
    // Render the game world (level, entities, etc.)
    _renderGameWorld(ctx, width, height) {
        // Render map/tiles
        if (this.mapManager) {
            this.mapManager.render(ctx, this.game.getCamera());
        }
        
        // Render exit
        const exit = this.game.getExit();
        if (exit) {
            exit.render(ctx, this.game.getCamera(), 0); // Player score would come from score system
        }
        
        // Render treasures
        const treasures = this.game.getTreasures();
        for (const treasure of treasures) {
            treasure.render(ctx, this.game.getCamera());
        }
        
        // Render AI agents
        const aiAgents = this.game.getAIAgents();
        for (const agent of aiAgents) {
            agent.render(ctx, this.game.getCamera());
        }
        
        // Render player (last so it's on top)
        const player = this.game.getPlayer();
        if (player) {
            player.render(ctx, this.game.getCamera());
        }
    }
    
    // Get current game state for HUD and other systems
    _getCurrentGameState() {
        const game = this.game;
        return {
            time: game.gameTime,
            levelTime: game.state === CONFIG.GAME_STATES.PLAYING ? (game.gameTime - game.levelStartTime) : 0,
            timeRemaining: game.timerSystem ? game.timerSystem.getTimeRemaining() : 0,
            player: game.getPlayer(),
            aiAgents: game.getAIAgents(),
            treasures: game.getTreasures(),
            exit: game.getExit(),
            scoreSystem: game.scoreSystem,
            level: game.getCurrentLevel(),
            difficulty: game.getCurrentDifficulty(),
            mapManager: game.mapManager
        };
    }
    
    // Render debug information
    _renderDebugInfo(ctx, width, height) {
        // Create a temporary debug panel or use existing systems
        // For now, we'll render basic debug info
        
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(0, 0, width, 200); // Top-left debug area
        ctx.restore();
        
        // Draw FPS
        ctx.fillStyle = '#00FF00';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('FPS: ' + Math.round(1000 / Math.max(16, this.renderTime)), 10, 10);
        
        // Draw debug info from game state
        const gameState = this._getCurrentGameState();
        
        let y = 30;
        if (gameState.player) {
            ctx.fillText('Player: ' + Math.round(gameState.player.position.x) + ',' + Math.round(gameState.player.position.y), 10, y);
            y += 16;
        }
        
        if (gameState.aiAgents && gameState.aiAgents.length > 0) {
            ctx.fillText('AI Agents: ' + gameState.aiAgents.length, 10, y);
            y += 16;
            for (let i = 0; i < Math.min(gameState.aiAgents.length, 3); i++) {
                const agent = gameState.aiAgents[i];
                ctx.fillText(`AI-${agent.agentId}: ${agent.stateMachine ? agent.stateMachine.getCurrentState() : 'active'}`, 10, y);
                y += 16;
            }
        }
        
        if (gameState.exit) {
            ctx.fillText('Exit: (' + Math.round(gameState.exit.position.x) + ',' + Math.round(gameState.exit.position.y) + ')', 10, y);
            y += 16;
            ctx.fillText('Active: ' + gameState.exit.active, 10, y);
            y += 16;
        }
    }
    
    // Set debug rendering flag
    setDebugRender(enabled) {
        this.debugRender = enabled;
    }
}

