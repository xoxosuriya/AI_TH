import { particles } from '../rendering/ParticleSystem.js';
import { sound } from '../utils/AudioSystem.js';

export class Game {
    constructor(canvas, assetLoader = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Managers and systems
        this.assetLoader = assetLoader;
        this.levelManager = null;
        this.entityManager = null;
        this.mapManager = null;
        this.camera = null;
        this.renderer = null;
        this.uiManager = null;
        this.inputManager = null;
        
        // Game state
        this.state = 'BOOT'; // BOOT, MENU, PLAYING, PAUSED, GAMEOVER, LEVEL_COMPLETE
        this.loadingProgress = 0;
        
        // Game loop
        this.lastTime = 0;
        this.animationFrame = null;
        
        // Bind methods
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    async start() {
        await this._initializeSystems();
        await this._loadAssets();
        this._startGameLoop();
    }
    
    async _initializeSystems() {
        // Import managers (dynamic imports for simplicity)
        const { LevelManager } = await import('../managers/LevelManager.js');
        const { EntityManager } = await import('../systems/EntityManager.js');
        const { MapManager } = await import('../maps/MapManager.js');
        const { Camera } = await import('../game/Camera.js');
        const { Renderer } = await import('../rendering/Renderer.js');
        const { UIManager } = await import('../ui/ManagerUI.js');
        const { InputManager } = await import('../utils/input.js');
        const { CONFIG } = await import('../config.js');
        
        this.levelManager = new LevelManager();
        this.entityManager = new EntityManager();
        this.mapManager = new MapManager();
        this.camera = new Camera();
        this.renderer = new Renderer(this);
        this.uiManager = new UIManager();
        this.inputManager = new InputManager();
        
        this.uiManager.onStartGame = (levelIndex, difficulty) => {
            this._loadLevel(levelIndex);
            this.state = 'PLAYING';
            this.uiManager.currentScreen = null;
        };
        
        // Set systems in renderer
        this.renderer.setSystems(null, this.mapManager, this.entityManager, this.uiManager, this.assetLoader);
        
        // Set entity factories in entity manager
        const { Player } = await import('../entities/Player.js');
        const { AIAgent } = await import('../entities/AIAgent.js');
        const { Treasure } = await import('../entities/Treasure.js');
        const { Exit } = await import('../entities/Exit.js');
        // Obstacle entity we'll create simple
        const { Entity } = await import('../entities/Entity.js');
        
        this.entityManager.setFactories({
            player: (x, y, opts) => new Player(x, y, opts),
            agent: (x, y, agentId, opts) => new AIAgent(x, y, agentId, opts),
            treasure: (x, y, type, opts) => new Treasure(x, y, type, opts),
            exit: (x, y, opts) => new Exit(x, y, opts),
            obstacle: (x, y, opts) => {
                const obstacle = new Entity(x, y, 'wall', { radius: 30 });
                obstacle.visible = false; // we'll rely on map rendering for walls
                return obstacle;
            }
        });
        
        // Set canvas size from config
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        // Load level data
        const { levels } = await import('../maps/levels.js');
        this.levelManager.loadLevels(levels);
        
        // Load first level
        this._loadLevel(0);
        this.state = 'MENU';
    }
    
    async _loadLevel(levelIndex) {
        if (typeof levelIndex === 'number') {
            this.levelManager.currentLevelIndex = levelIndex;
        }
        const levelData = this.levelManager.getCurrentLevel();
        if (!levelData) return;
        
        // Clear previous entities
        this.entityManager.clear();
        
        this.mapManager.loadLevel(levelData);
        this.camera.setWorldBounds(this.mapManager.getPixelWidth(), this.mapManager.getPixelHeight());
        this.entityManager.obstacles = this.mapManager.getObstacles();
        
        // Set spawn points
        const playerSpawn = this.mapManager.getPlayerSpawn();
        if (playerSpawn) {
            this.entityManager.createPlayer(playerSpawn.x * 64 + 32, playerSpawn.y * 64 + 32);
            this.camera.follow(this.entityManager.player);
            this.camera.centerX = playerSpawn.x * 64 + 32;
            this.camera.centerY = playerSpawn.y * 64 + 32;
        }
        
        const aiSpawns = this.mapManager.getAISpawns();
        aiSpawns.forEach((spawn, index) => {
            this.entityManager.createAIAgent(spawn.x * 64 + 32, spawn.y * 64 + 32, `ai_${index}`);
        });
        
        const treasures = levelData.treasures || [];
        if (treasures.length > 0) {
            treasures.forEach(t => {
                this.entityManager.createTreasure(t.x * 64 + 32, t.y * 64 + 32, t.type || 'coin');
            });
        } else {
            const treasureSpawns = this.mapManager.getTreasureSpawns();
            treasureSpawns.forEach((spawn, index) => {
                this.entityManager.createTreasure(spawn.x * 64 + 32, spawn.y * 64 + 32, 'coin');
            });
        }
        
        const exitSpawn = this.mapManager.getExitSpawn();
        if (exitSpawn) {
            this.entityManager.createExit(exitSpawn.x * 64 + 32, exitSpawn.y * 64 + 32);
        }
    }
    
    async _loadAssets() {
        // Simulate loading using the already‑provided assetLoader
        return new Promise(resolve => {
            setTimeout(() => {
                this.loadingProgress = 1;
                resolve();
            }, 1000);
        });
    }
    
    _startGameLoop() {
        this.lastTime = performance.now();
        this.animationFrame = requestAnimationFrame(this.gameLoop);
    }
    
    gameLoop(timestamp) {
        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1); // seconds, capped to avoid large delta spikes
        this.lastTime = timestamp;
        
        this.update(deltaTime);
        this.render();
        
        this.animationFrame = requestAnimationFrame(this.gameLoop);
    }
    
    update(deltaTime) {
        if (this.uiManager) {
            this.uiManager.update(deltaTime, this.inputManager);
        }
        
        switch (this.state) {
            case 'BOOT':
                // boot logic
                break;
            case 'MENU':
                if (this.uiManager.currentScreen === null) {
                    this.state = 'PLAYING';
                }
                break;
            case 'PLAYING':
                // Keyboard shortcuts during gameplay
                if (this.inputManager.justPressed('KeyP') || this.inputManager.justPressed('Escape')) {
                    sound.playMenuSelect();
                    this.state = 'PAUSED';
                    this.uiManager.showPause();
                    break;
                }
                if (this.inputManager.justPressed('KeyM')) {
                    sound.toggleMute();
                }
                if (this.inputManager.justPressed('KeyR')) {
                    sound.playMenuSelect();
                    this._loadLevel(this.levelManager.currentLevelIndex);
                    break;
                }
                if (this.inputManager.justPressed('F1')) {
                    this.showDebug = !this.showDebug;
                }
                
                // Handle player input
                if (this.entityManager.player) {
                    this.entityManager.player.handleInput(this.inputManager);
                }
                // Update entities
                this.entityManager.update(deltaTime, {
                    time: performance.now(),
                    mapManager: this.mapManager
                });
                // Update particles
                particles.update(deltaTime);
                // Update camera to follow player
                this.camera.update(deltaTime);
                
                // Check level completion
                const currentLvl = this.levelManager.getCurrentLevel();
                const targetScore = currentLvl ? (currentLvl.targetScore || 60) : 60;
                if (this.entityManager.exit) {
                    const playerScore = this.entityManager.player ? this.entityManager.player.score : 0;
                    this.entityManager.exit.update(deltaTime, playerScore);
                    
                    if (this.entityManager.exit.active && this.entityManager.player && this.entityManager.player.overlaps(this.entityManager.exit)) {
                        sound.playVictory();
                        particles.emitTreasureBurst(this.entityManager.exit.position.x, this.entityManager.exit.position.y, '#10B981', 35);
                        this.levelManager.unlockLevel(this.levelManager.currentLevelIndex + 1);
                        this.state = 'LEVEL_COMPLETE';
                        this.uiManager.showLevelResults({
                            score: playerScore,
                            targetScore: targetScore,
                            level: currentLvl,
                            success: true
                        });
                    }
                }
                break;
            case 'PAUSED':
                if (this.inputManager.justPressed('KeyP') || this.inputManager.justPressed('Escape')) {
                    sound.playMenuSelect();
                    this.state = 'PLAYING';
                    this.uiManager.currentScreen = null;
                } else if (this.inputManager.justPressed('KeyR')) {
                    sound.playMenuSelect();
                    this._loadLevel(this.levelManager.currentLevelIndex);
                    this.state = 'PLAYING';
                    this.uiManager.currentScreen = null;
                } else if (this.inputManager.justPressed('KeyM')) {
                    sound.playMenuHover();
                    this.state = 'MENU';
                    this.uiManager.showMenu();
                }
                break;
            case 'LEVEL_COMPLETE':
                if (this.inputManager.justPressed('Enter') || this.inputManager.justPressed('KeyN')) {
                    sound.playMenuSelect();
                    if (this.levelManager.hasNextLevel()) {
                        this.levelManager.nextLevel();
                    }
                    this._loadLevel(this.levelManager.currentLevelIndex);
                    this.state = 'PLAYING';
                    this.uiManager.currentScreen = null;
                } else if (this.inputManager.justPressed('KeyR')) {
                    sound.playMenuSelect();
                    this._loadLevel(this.levelManager.currentLevelIndex);
                    this.state = 'PLAYING';
                    this.uiManager.currentScreen = null;
                } else if (this.inputManager.justPressed('KeyM') || this.inputManager.justPressed('Escape')) {
                    sound.playMenuHover();
                    this.state = 'MENU';
                    this.uiManager.showMenu();
                }
                break;
            default:
                break;
        }
        
        this.inputManager.update();
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#0B0D13';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            // Render map
            this.mapManager.render(this.ctx, this.camera);
            
            // Render entities
            this.entityManager.renderAll(this.ctx, this.camera);
            
            // Render dynamic particles
            particles.render(this.ctx, this.camera);
            
            // Neural path debug overlay (F1 toggle)
            if (this.showDebug && this.entityManager.aiAgents) {
                this.ctx.save();
                for (const agent of this.entityManager.aiAgents) {
                    const aScr = this.camera.worldToScreen(agent.position.x, agent.position.y);
                    
                    // Draw sensory circle
                    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.arc(aScr.x, aScr.y, (agent.perception?.radius || 240) * this.camera.scale, 0, Math.PI * 2);
                    this.ctx.stroke();
                    
                    // Draw target vector line
                    if (agent.currentTarget) {
                        const tScr = this.camera.worldToScreen(agent.currentTarget.position.x, agent.currentTarget.position.y);
                        this.ctx.setLineDash([6, 6]);
                        this.ctx.strokeStyle = '#F43F5E';
                        this.ctx.lineWidth = 1.5;
                        this.ctx.beginPath();
                        this.ctx.moveTo(aScr.x, aScr.y);
                        this.ctx.lineTo(tScr.x, tScr.y);
                        this.ctx.stroke();
                        this.ctx.setLineDash([]);
                    }
                    
                    // Draw path waypoints
                    if (agent.currentPath && agent.currentPath.length > 0) {
                        this.ctx.strokeStyle = '#10B981';
                        this.ctx.lineWidth = 2;
                        this.ctx.beginPath();
                        this.ctx.moveTo(aScr.x, aScr.y);
                        for (let p = agent.pathIndex || 0; p < agent.currentPath.length; p++) {
                            const wp = agent.currentPath[p];
                            const wpScr = this.camera.worldToScreen(wp.x * 64 + 32, wp.y * 64 + 32);
                            this.ctx.lineTo(wpScr.x, wpScr.y);
                        }
                        this.ctx.stroke();
                    }
                }
                this.ctx.restore();
            }
            
            // Ambient torchlight vignette centered on player
            if (this.entityManager.player) {
                const pScreen = this.camera.worldToScreen(this.entityManager.player.position.x, this.entityManager.player.position.y);
                const lightRadius = 380 * this.camera.scale;
                const vignette = this.ctx.createRadialGradient(pScreen.x, pScreen.y, 80 * this.camera.scale, pScreen.x, pScreen.y, lightRadius);
                vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
                vignette.addColorStop(0.7, 'rgba(11, 13, 19, 0.45)');
                vignette.addColorStop(1, 'rgba(11, 13, 19, 0.88)');
                
                this.ctx.save();
                this.ctx.fillStyle = vignette;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.restore();
            }
            
            // Render HUD
            this.uiManager.renderHUD(this.ctx, this.canvas.width, this.canvas.height, {
                time: this.lastTime,
                player: this.entityManager.player,
                aiAgents: this.entityManager.aiAgents,
                treasures: this.entityManager.treasures,
                exit: this.entityManager.exit,
                level: this.levelManager.getCurrentLevel()
            });
            
            // If paused, also render pause overlay screen
            if (this.state === 'PAUSED') {
                this.uiManager.render(this.ctx, this.canvas.width, this.canvas.height);
            }
        } else {
            // Render UI
            this.uiManager.render(this.ctx, this.canvas.width, this.canvas.height);
        }
        
        // Debug overlay if needed
        if (this.state === 'PLAYING') {
            // draw loading progress if still loading
            if (this.loadingProgress < 1) {
                this.ctx.fillStyle = '#00F';
                const barWidth = 200 * this.loadingProgress;
                this.ctx.fillRect(20, 20, barWidth, 20);
            }
        }
    }
    
    // Getters for renderer
    getCtx() {
        return this.ctx;
    }
    
    getCanvas() {
        return this.canvas;
    }
    
    getState() {
        return this.state;
    }
    
    // Stop game loop
    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}


