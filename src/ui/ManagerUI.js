// UI manager - handles all UI screens and user interface
import { sound } from '../utils/AudioSystem.js';

export class UIManager {
    constructor() {
        // Current UI state
        this.currentScreen = null;
        this.screens = {}; // screenName -> screenObject
        
        // UI state data
        this.menuSelection = 0;
        this.difficultySelection = 1; // Medium by default
        this.levelSelection = 0;
        this.countdownValue = 3;
        this.countdownTimer = 0;
        this.isCountdownActive = false;
        this.lastInputTime = 0;
        
        // Initialize screens
        this._initializeScreens();
    }
    
    // Initialize all UI screens
    _initializeScreens() {
        this.screens.menu = new MenuScreen(this);
        this.screens.difficultySelect = new DifficultySelectScreen(this);
        this.screens.levelSelect = new LevelSelectScreen(this);
        this.screens.tutorial = new TutorialScreen(this);
        this.screens.howAIWorks = new HowAIWorksScreen(this);
        this.screens.pause = new PauseScreen(this);
        this.screens.levelResults = new LevelResultsScreen(this);
        this.screens.gameComplete = new GameCompleteScreen(this);
        
        // Set default screen
        this.currentScreen = this.screens.menu;
    }
    
    // Update UI state
    update(deltaTime, inputManager) {
        if (this.currentScreen && typeof this.currentScreen.update === 'function') {
            this.currentScreen.update(deltaTime, inputManager);
        }
        
        if (this.isCountdownActive) {
            this._updateCountdown(deltaTime);
        }
    }
    
    // Render UI
    render(ctx, canvasWidth, canvasHeight) {
        if (this.currentScreen && typeof this.currentScreen.render === 'function') {
            this.currentScreen.render(ctx, canvasWidth, canvasHeight);
        }
        
        if (this.isCountdownActive) {
            this._renderCountdown(ctx, canvasWidth, canvasHeight);
        }
    }
    
    // Render HUD (during gameplay)
    renderHUD(ctx, canvasWidth, canvasHeight, gameState) {
        this._renderBasicHUD(ctx, canvasWidth, canvasHeight, gameState);
    }
    
    // Show a specific screen
    showScreen(screenName) {
        const screen = this.screens[screenName];
        if (screen) {
            this.currentScreen = screen;
            if (typeof this.currentScreen.onShow === 'function') {
                this.currentScreen.onShow();
            }
            return true;
        }
        return false;
    }
    
    showMenu() { return this.showScreen('menu'); }
    showDifficultySelect() { return this.showScreen('difficultySelect'); }
    showLevelSelect() { return this.showScreen('levelSelect'); }
    showTutorial() { return this.showScreen('tutorial'); }
    showHowAIWorks() { return this.showScreen('howAIWorks'); }
    showPause() { return this.showScreen('pause'); }
    
    showLevelResults(results) {
        const screen = this.screens.levelResults;
        if (screen) {
            this.currentScreen = screen;
            if (typeof this.currentScreen.onShow === 'function') {
                this.currentScreen.onShow(results);
            }
            return true;
        }
        return false;
    }
    
    showGameComplete() { return this.showScreen('gameComplete'); }
    
    getSelectedDifficulty() {
        const difficulties = ['easy', 'medium', 'hard', 'extreme'];
        return difficulties[this.difficultySelection] || 'medium';
    }
    
    setSelectedDifficulty(index) {
        if (index >= 0 && index < 4) {
            this.difficultySelection = index;
            return true;
        }
        return false;
    }
    
    getSelectedLevel() {
        return this.levelSelection + 1;
    }
    
    setSelectedLevel(index) {
        this.levelSelection = index;
        return true;
    }
    
    startCountdown() {
        this.countdownValue = 3;
        this.countdownTimer = 0;
        this.isCountdownActive = true;
    }
    
    isCountdownComplete() {
        return !this.isCountdownActive;
    }
    
    _updateCountdown(deltaTime) {
        this.countdownTimer += deltaTime * 1000;
        if (this.countdownTimer >= 1000) {
            this.countdownTimer = 0;
            this.countdownValue--;
            if (this.countdownValue <= 0) {
                this.isCountdownActive = false;
            }
        }
    }
    
    _renderCountdown(ctx, canvasWidth, canvasHeight) {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 14, 23, 0.75)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.05;
        
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 70 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.countdownValue > 0) {
            ctx.font = 'bold 72px "Outfit", "Space Grotesk", sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(this.countdownValue, cx, cy);
            ctx.font = '600 14px "Space Grotesk", monospace';
            ctx.fillStyle = '#38BDF8';
            ctx.fillText('INITIALIZING AGENTS...', cx, cy + 50);
        } else {
            ctx.font = 'bold 64px "Outfit", "Space Grotesk", sans-serif';
            ctx.fillStyle = '#10B981';
            ctx.fillText('ENGAGE!', cx, cy);
        }
        ctx.restore();
    }
    
    _renderBasicHUD(ctx, canvasWidth, canvasHeight, gameState = {}) {
        ctx.save();
        
        const player = gameState.player;
        const aiAgents = gameState.aiAgents || [];
        const level = gameState.level || {};
        const targetScore = level.targetScore || 80;
        const playerScore = player ? player.score : 0;
        const isUnlocked = playerScore >= targetScore;
        const diffName = this.getSelectedDifficulty().toUpperCase();
        
        // 1. Top Glass Header Bar
        const barH = 54;
        const grad = ctx.createLinearGradient(0, 0, 0, barH + 10);
        grad.addColorStop(0, 'rgba(11, 15, 25, 0.92)');
        grad.addColorStop(1, 'rgba(11, 15, 25, 0.7)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, barH);
        
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, barH);
        ctx.lineTo(canvasWidth, barH);
        ctx.stroke();
        
        // Left: Sector & Difficulty Tag
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 16px "Outfit", "Space Grotesk", sans-serif';
        ctx.fillStyle = '#F8FAFC';
        const levelTitle = level.name ? `SECTOR ${level.number || this.getSelectedLevel()} \u00B7 ${level.name.toUpperCase()}` : `SECTOR ${this.getSelectedLevel()}`;
        ctx.fillText(levelTitle, 20, 20);
        
        let diffColor = '#38BDF8';
        if (diffName === 'MEDIUM') diffColor = '#10B981';
        if (diffName === 'HARD') diffColor = '#F59E0B';
        if (diffName === 'EXTREME') diffColor = '#EF4444';
        
        ctx.font = '600 11px "Space Grotesk", monospace';
        ctx.fillStyle = diffColor;
        ctx.fillText(`THREAT: ${diffName}`, 20, 38);
        
        // Center: Target Progress Bar & Exit Beacon Alert
        const barW = 280;
        const barX = (canvasWidth - barW) / 2;
        const barY = 16;
        const progress = Math.min(1, playerScore / targetScore);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this._roundRect(ctx, barX, barY, barW, 14, 7);
        ctx.fill();
        
        if (progress > 0) {
            const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
            fillGrad.addColorStop(0, '#38BDF8');
            fillGrad.addColorStop(1, isUnlocked ? '#10B981' : '#F59E0B');
            ctx.fillStyle = fillGrad;
            this._roundRect(ctx, barX, barY, Math.max(14, barW * progress), 14, 7);
            ctx.fill();
        }
        
        ctx.textAlign = 'center';
        ctx.font = 'bold 11px "Space Grotesk", monospace';
        if (isUnlocked) {
            const pulse = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
            ctx.fillStyle = `rgba(16, 185, 129, ${pulse})`;
            ctx.fillText(`\u2713 EXIT PORTAL ACTIVE \u00B7 HEAD TO BEACON!`, canvasWidth / 2, 42);
        } else {
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(`QUOTA: ${playerScore} / ${targetScore} PTS (${Math.floor(progress * 100)}%)`, canvasWidth / 2, 42);
        }
        
        // Right: Real-time Leaderboard Deck
        const rightX = canvasWidth - 20;
        ctx.textAlign = 'right';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(`YOU: ${playerScore} PTS`, rightX, 20);
        
        let topAI = null;
        for (const ai of aiAgents) {
            if (!topAI || ai.score > topAI.score) topAI = ai;
        }
        ctx.font = '500 12px "Space Grotesk", monospace';
        if (topAI) {
            ctx.fillStyle = '#F43F5E';
            ctx.fillText(`DRONE ${topAI.agentId || 1}: ${topAI.score} PTS`, rightX, 38);
        } else {
            ctx.fillStyle = '#64748B';
            ctx.fillText(`AGENTS: 0`, rightX, 38);
        }
        
        // Bottom: Micro Controls Ribbon
        ctx.textAlign = 'center';
        ctx.font = '500 11px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
        ctx.fillText('WASD: MOVE \u00B7 P: PAUSE \u00B7 R: RESTART \u00B7 M: AUDIO \u00B7 F1: NEURAL HUD', canvasWidth / 2, canvasHeight - 14);
        
        ctx.restore();
    }
    
    _roundRect(ctx, x, y, w, h, r) {
        if (typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
        } else {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        }
    }
    
    handleInput(inputManager) {
        const now = Date.now();
        if (now - this.lastInputTime < 140) {
            return false;
        }
        
        let handled = false;
        if (this.currentScreen && typeof this.currentScreen.handleInput === 'function') {
            handled = this.currentScreen.handleInput(inputManager);
        }
        
        if (handled) {
            this.lastInputTime = now;
        }
        
        return handled;
    }
}

// -------------------------------------------------------------------------
// Base UI Screen
// -------------------------------------------------------------------------
class UIScreen {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.time = 0;
    }
    
    update(deltaTime, inputManager) {
        this.time += deltaTime;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        this._renderBackdrop(ctx, canvasWidth, canvasHeight);
    }
    
    onShow() {
        this.time = 0;
    }
    
    handleInput(inputManager) {
        return false;
    }
    
    _renderBackdrop(ctx, w, h) {
        ctx.save();
        const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, Math.max(w, h));
        bgGrad.addColorStop(0, '#0F172A');
        bgGrad.addColorStop(0.7, '#090D16');
        bgGrad.addColorStop(1, '#05070B');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
        
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
        ctx.lineWidth = 1;
        const gridSize = 48;
        const offsetX = (this.time * 8) % gridSize;
        const offsetY = (this.time * 8) % gridSize;
        
        ctx.beginPath();
        for (let x = -gridSize + offsetX; x < w + gridSize; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        for (let y = -gridSize + offsetY; y < h + gridSize; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.stroke();
        
        const g1 = ctx.createRadialGradient(w * 0.2, h * 0.25, 10, w * 0.2, h * 0.25, 240);
        g1.addColorStop(0, 'rgba(56, 189, 248, 0.09)');
        g1.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);
        
        const g2 = ctx.createRadialGradient(w * 0.8, h * 0.75, 10, w * 0.8, h * 0.75, 260);
        g2.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
        g2.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);
        
        ctx.restore();
    }
    
    _roundRect(ctx, x, y, w, h, r) {
        if (typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
        } else {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        }
    }
}

// -------------------------------------------------------------------------
// 1. Menu Screen
// -------------------------------------------------------------------------
class MenuScreen extends UIScreen {
    constructor(uiManager) {
        super(uiManager);
        this.selectedIndex = 0;
        this.items = [
            { id: 'play', title: 'DEPLOY OPERATIVE', subtitle: 'Enter active sector against autonomous agents' },
            { id: 'difficulty', title: 'DIFFICULTY MATRIX', subtitle: 'Configure drone heuristic aggression & count' },
            { id: 'levels', title: 'MISSION SECTORS', subtitle: 'Select dungeon sector and target quotas' },
            { id: 'ai', title: 'HOW AI WORKS', subtitle: 'Interactive deep-dive into A* & Utility algorithms' },
            { id: 'tutorial', title: 'OPERATOR MANUAL', subtitle: 'Review flight controls & scoring breakdown' }
        ];
    }
    
    update(deltaTime, inputManager) {
        super.update(deltaTime, inputManager);
        
        if (inputManager.justPressed('ArrowDown') || inputManager.justPressed('KeyS')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
            sound.playMenuHover();
            return true;
        }
        if (inputManager.justPressed('ArrowUp') || inputManager.justPressed('KeyW')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
            sound.playMenuHover();
            return true;
        }
        
        if (inputManager.justPressed('Enter') || inputManager.justPressed('Space')) {
            sound.playMenuSelect();
            switch (this.selectedIndex) {
                case 0:
                    this.uiManager.showScreen('levelSelect');
                    break;
                case 1:
                    this.uiManager.showScreen('difficultySelect');
                    break;
                case 2:
                    this.uiManager.showScreen('levelSelect');
                    break;
                case 3:
                    this.uiManager.showScreen('howAIWorks');
                    break;
                case 4:
                    this.uiManager.showScreen('tutorial');
                    break;
            }
            return true;
        }
        return false;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        super.render(ctx, canvasWidth, canvasHeight);
        ctx.save();
        
        const cx = canvasWidth / 2;
        
        // Brand Header Badge
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '600 12px "Space Grotesk", monospace';
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('\u25C6  AUTONOMOUS MULTI-AGENT ARENA  \u25C6', cx, 52);
        
        // Title with glowing gradient
        ctx.font = 'bold 44px "Outfit", "Space Grotesk", sans-serif';
        const titleGrad = ctx.createLinearGradient(cx - 200, 0, cx + 200, 0);
        titleGrad.addColorStop(0, '#FFFFFF');
        titleGrad.addColorStop(0.5, '#E2E8F0');
        titleGrad.addColorStop(1, '#38BDF8');
        ctx.fillStyle = titleGrad;
        ctx.fillText('AI TREASURE HUNTER', cx, 96);
        
        // Subtitle
        ctx.font = '400 14px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('High-stakes algorithmic competition against autonomous heuristic drones', cx, 134);
        
        // Menu Cards
        const cardW = 540;
        const cardH = 58;
        const startY = 175;
        const gap = 14;
        
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const y = startY + i * (cardH + gap);
            const isSelected = i === this.selectedIndex;
            
            ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.14)' : 'rgba(15, 23, 42, 0.65)';
            this._roundRect(ctx, cx - cardW / 2, y, cardW, cardH, 10);
            ctx.fill();
            
            ctx.strokeStyle = isSelected ? '#38BDF8' : 'rgba(148, 163, 184, 0.15)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.stroke();
            
            if (isSelected) {
                ctx.fillStyle = '#38BDF8';
                this._roundRect(ctx, cx - cardW / 2 + 10, y + 14, 4, cardH - 28, 2);
                ctx.fill();
            }
            
            ctx.textAlign = 'left';
            ctx.font = isSelected ? 'bold 17px "Outfit", sans-serif' : '600 16px "Outfit", sans-serif';
            ctx.fillStyle = isSelected ? '#FFFFFF' : '#CBD5E1';
            ctx.fillText(item.title, cx - cardW / 2 + 28, y + 22);
            
            ctx.font = '400 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = isSelected ? '#93C5FD' : '#64748B';
            ctx.fillText(item.subtitle, cx - cardW / 2 + 28, y + 42);
            
            if (isSelected) {
                ctx.textAlign = 'right';
                ctx.font = 'bold 18px "Space Grotesk", sans-serif';
                ctx.fillStyle = '#38BDF8';
                ctx.fillText('\u2192', cx + cardW / 2 - 20, y + cardH / 2);
            }
        }
        
        ctx.textAlign = 'center';
        ctx.font = '500 12px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.fillText('\u2191 / \u2193 NAVIGATE \u00B7 ENTER / SPACE CONFIRM \u00B7 M MUTE', cx, canvasHeight - 28);
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}

// -------------------------------------------------------------------------
// 2. Difficulty Select Screen
// -------------------------------------------------------------------------
class DifficultySelectScreen extends UIScreen {
    constructor(uiManager) {
        super(uiManager);
        this.selectedIndex = this.uiManager.difficultySelection || 1;
        this.options = [
            {
                title: 'SCOUT',
                tag: 'EASY',
                color: '#38BDF8',
                drones: '1 Drone',
                speed: 'Normal (105 px/s)',
                heuristic: 'Basic Utility',
                desc: 'Balanced intro. Drone explores conservatively, giving you ample room to gather relics.'
            },
            {
                title: 'TACTICIAN',
                tag: 'BALANCED',
                color: '#10B981',
                drones: '2 Drones',
                speed: 'Fast (125 px/s)',
                heuristic: 'Adaptive A*',
                desc: 'Contested arena. Two intelligent drones actively evaluate treasure payoff vs travel distance.'
            },
            {
                title: 'WARLORD',
                tag: 'AGGRESSIVE',
                color: '#F59E0B',
                drones: '3 Drones',
                speed: 'High (140 px/s)',
                heuristic: 'Greedy Heuristic',
                desc: 'Ruthless pressure. AI prioritizes rare gems and cuts off choke points with tight navigation.'
            },
            {
                title: 'HIVE MIND',
                tag: 'EXTREME',
                color: '#EF4444',
                drones: '4 Drones',
                speed: 'Overclocked (160 px/s)',
                heuristic: 'Optimal Saturation',
                desc: 'Maximum challenge. 4 synchronized drones strip the dungeon clean with near-zero hesitation.'
            }
        ];
    }
    
    onShow() {
        super.onShow();
        this.selectedIndex = this.uiManager.difficultySelection;
    }
    
    update(deltaTime, inputManager) {
        super.update(deltaTime, inputManager);
        
        if (inputManager.justPressed('ArrowDown') || inputManager.justPressed('KeyS') ||
            inputManager.justPressed('ArrowRight') || inputManager.justPressed('KeyD')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
            sound.playMenuHover();
            return true;
        }
        if (inputManager.justPressed('ArrowUp') || inputManager.justPressed('KeyW') ||
            inputManager.justPressed('ArrowLeft') || inputManager.justPressed('KeyA')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.options.length) % this.options.length;
            sound.playMenuHover();
            return true;
        }
        if (inputManager.justPressed('Enter') || inputManager.justPressed('Space')) {
            sound.playMenuSelect();
            this.uiManager.setSelectedDifficulty(this.selectedIndex);
            this.uiManager.showScreen('levelSelect');
            return true;
        }
        if (inputManager.justPressed('Escape') || inputManager.justPressed('KeyM')) {
            sound.playMenuHover();
            this.uiManager.showScreen('menu');
            return true;
        }
        return false;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        super.render(ctx, canvasWidth, canvasHeight);
        ctx.save();
        
        const cx = canvasWidth / 2;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 32px "Outfit", "Space Grotesk", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('SELECT DIFFICULTY MATRIX', cx, 55);
        
        ctx.font = '400 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Calibrate autonomous agent density, search heuristics, and reaction velocity', cx, 88);
        
        const cardW = 580;
        const cardH = 88;
        const startY = 125;
        const gap = 16;
        
        for (let i = 0; i < this.options.length; i++) {
            const opt = this.options[i];
            const y = startY + i * (cardH + gap);
            const isSelected = i === this.selectedIndex;
            
            ctx.fillStyle = isSelected ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.65)';
            this._roundRect(ctx, cx - cardW / 2, y, cardW, cardH, 12);
            ctx.fill();
            
            ctx.strokeStyle = isSelected ? opt.color : 'rgba(148, 163, 184, 0.15)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.stroke();
            
            ctx.fillStyle = opt.color;
            this._roundRect(ctx, cx - cardW / 2 + 12, y + 16, 4, cardH - 32, 2);
            ctx.fill();
            
            ctx.textAlign = 'left';
            ctx.font = 'bold 18px "Outfit", sans-serif';
            ctx.fillStyle = isSelected ? '#FFFFFF' : '#E2E8F0';
            ctx.fillText(opt.title, cx - cardW / 2 + 30, y + 26);
            
            ctx.font = 'bold 11px "Space Grotesk", monospace';
            ctx.fillStyle = opt.color;
            ctx.fillText(`[ ${opt.tag} ]`, cx - cardW / 2 + 130, y + 26);
            
            ctx.font = '500 12px "Space Grotesk", monospace';
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(`\u25C6 ${opt.drones}   \u25C6 ${opt.speed}   \u25C6 ${opt.heuristic}`, cx - cardW / 2 + 30, y + 48);
            
            ctx.font = '400 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#64748B';
            ctx.fillText(opt.desc, cx - cardW / 2 + 30, y + 68);
            
            if (isSelected) {
                ctx.textAlign = 'right';
                ctx.font = 'bold 20px "Space Grotesk", sans-serif';
                ctx.fillStyle = opt.color;
                ctx.fillText('\u2713', cx + cardW / 2 - 24, y + cardH / 2);
            }
        }
        
        ctx.textAlign = 'center';
        ctx.font = '500 12px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.fillText('\u2191 / \u2193 SELECT \u00B7 ENTER CONFIRM \u00B7 ESC BACK', cx, canvasHeight - 26);
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}

// -------------------------------------------------------------------------
// 3. Level Select Screen
// -------------------------------------------------------------------------
class LevelSelectScreen extends UIScreen {
    constructor(uiManager) {
        super(uiManager);
        this.selectedIndex = this.uiManager.levelSelection || 0;
        this.sectors = [
            {
                number: 1,
                name: 'Ruins Entrance',
                tag: 'SECTOR 01',
                target: '80 PTS',
                time: '90s Limit',
                treasures: '4 High Relics',
                desc: 'Open-air stone pavilions. Direct sightlines and broad corridors.'
            },
            {
                number: 2,
                name: 'The Sunken Crypt',
                tag: 'SECTOR 02',
                target: '100 PTS',
                time: '100s Limit',
                treasures: '6 Scattered Relics',
                desc: 'Tight corridors and blind corners. Heavy A* path recalculation required.'
            },
            {
                number: 3,
                name: 'The Cybernetic Core',
                tag: 'SECTOR 03',
                target: '150 PTS',
                time: '120s Limit',
                treasures: '8 Dynamic Relics',
                desc: 'Complex multi-ring vault. Severe agent contestation over legendary nodes.'
            }
        ];
    }
    
    update(deltaTime, inputManager) {
        super.update(deltaTime, inputManager);
        
        if (inputManager.justPressed('ArrowDown') || inputManager.justPressed('KeyS') ||
            inputManager.justPressed('ArrowRight') || inputManager.justPressed('KeyD')) {
            this.selectedIndex = (this.selectedIndex + 1) % this.sectors.length;
            sound.playMenuHover();
            return true;
        }
        if (inputManager.justPressed('ArrowUp') || inputManager.justPressed('KeyW') ||
            inputManager.justPressed('ArrowLeft') || inputManager.justPressed('KeyA')) {
            this.selectedIndex = (this.selectedIndex - 1 + this.sectors.length) % this.sectors.length;
            sound.playMenuHover();
            return true;
        }
        if (inputManager.justPressed('Enter') || inputManager.justPressed('Space')) {
            sound.playMenuSelect();
            this.uiManager.setSelectedLevel(this.selectedIndex);
            this.uiManager.currentScreen = null;
            if (typeof this.uiManager.onStartGame === 'function') {
                this.uiManager.onStartGame(this.selectedIndex, this.uiManager.getSelectedDifficulty());
            }
            return true;
        }
        if (inputManager.justPressed('Escape')) {
            sound.playMenuHover();
            this.uiManager.showScreen('menu');
            return true;
        }
        return false;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        super.render(ctx, canvasWidth, canvasHeight);
        ctx.save();
        
        const cx = canvasWidth / 2;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 32px "Outfit", "Space Grotesk", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('CHOOSE MISSION SECTOR', cx, 65);
        
        ctx.font = '400 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Select your deployment arena and examine tactical target score objectives', cx, 100);
        
        const cardW = 560;
        const cardH = 96;
        const startY = 145;
        const gap = 20;
        
        for (let i = 0; i < this.sectors.length; i++) {
            const sec = this.sectors[i];
            const y = startY + i * (cardH + gap);
            const isSelected = i === this.selectedIndex;
            
            ctx.fillStyle = isSelected ? 'rgba(30, 41, 59, 0.92)' : 'rgba(15, 23, 42, 0.65)';
            this._roundRect(ctx, cx - cardW / 2, y, cardW, cardH, 12);
            ctx.fill();
            
            ctx.strokeStyle = isSelected ? '#10B981' : 'rgba(148, 163, 184, 0.15)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.stroke();
            
            ctx.fillStyle = isSelected ? '#10B981' : '#38BDF8';
            this._roundRect(ctx, cx - cardW / 2 + 14, y + 16, 4, cardH - 32, 2);
            ctx.fill();
            
            ctx.textAlign = 'left';
            ctx.font = 'bold 18px "Outfit", sans-serif';
            ctx.fillStyle = isSelected ? '#FFFFFF' : '#E2E8F0';
            ctx.fillText(`${sec.tag} \u00B7 ${sec.name}`, cx - cardW / 2 + 32, y + 28);
            
            ctx.font = '600 12px "Space Grotesk", monospace';
            ctx.fillStyle = '#10B981';
            ctx.fillText(`QUOTA: ${sec.target}`, cx - cardW / 2 + 32, y + 54);
            
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(`\u25C6 ${sec.time}   \u25C6 ${sec.treasures}`, cx - cardW / 2 + 160, y + 54);
            
            ctx.font = '400 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#64748B';
            ctx.fillText(sec.desc, cx - cardW / 2 + 32, y + 76);
            
            if (isSelected) {
                ctx.textAlign = 'right';
                ctx.font = 'bold 15px "Outfit", sans-serif';
                ctx.fillStyle = '#10B981';
                ctx.fillText('DEPLOY \u2192', cx + cardW / 2 - 24, y + cardH / 2);
            }
        }
        
        ctx.textAlign = 'center';
        ctx.font = '500 12px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.fillText('\u2191 / \u2193 SELECT \u00B7 ENTER DEPLOY MISSION \u00B7 ESC BACK', cx, canvasHeight - 28);
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}

// -------------------------------------------------------------------------
// 4. How AI Works Screen
// -------------------------------------------------------------------------
class HowAIWorksScreen extends UIScreen {
    constructor(uiManager) {
        super(uiManager);
        this.tabIndex = 0;
        this.tabs = [
            {
                title: '1. SENSORS & FOV',
                header: 'Raycasting Perception Engine',
                formula: 'Perception = { T | dist(Agent, T) <= R_sense and ClearRaycast(Agent, T) }',
                points: [
                    'The AI agent continuously scans its surroundings up to a radius of 300 pixels.',
                    'Obstacles like stone walls block line-of-sight using tile raycasting.',
                    'Treasures outside the field-of-view remain unknown until the drone moves closer.'
                ]
            },
            {
                title: '2. UTILITY SCORING',
                header: 'Dynamic Payoff Valuation',
                formula: 'Utility(T) = (Value^1.2) / (Distance + 15) * ContestPenalty',
                points: [
                    'Every spotted relic is assigned an objective utility score.',
                    'Gems & Artifacts (50-100 pts) are weighted non-linearly over cheap 10 pt coins.',
                    'If a competitor or player is already closer to a relic, its ContestPenalty drops drastically.'
                ]
            },
            {
                title: '3. A* PATHFINDING',
                header: 'Grid Heuristic Navigation',
                formula: 'f(n) = g(n) + h(n),  h(n) = |dx| + |dy| + 0.001 * tiebreaker',
                points: [
                    'A* evaluates optimal waypoint corridors across the 20x12 tile navigation mesh.',
                    'Heuristic h(n) uses Manhattan distance with tie-breaker cross-products to prevent zig-zags.',
                    'When walls or doors block a corridor, the agent recalculates in under 1.2ms.'
                ]
            },
            {
                title: '4. STEERING & AVOIDANCE',
                header: 'Kinematic Separation & Smoothing',
                formula: 'v_desired = Normalize(Target - Pos) * v_max;  F_steer = v_desired - v_curr',
                points: [
                    'Waypoints are smoothed using continuous steering vectors instead of robotic grid snaps.',
                    'Separation forces prevent drones from clipping through each other in narrow doorways.',
                    'Once a treasure is consumed, the drone instantly reprioritizes its next highest utility.'
                ]
            }
        ];
    }
    
    update(deltaTime, inputManager) {
        super.update(deltaTime, inputManager);
        
        if (inputManager.justPressed('ArrowRight') || inputManager.justPressed('KeyD')) {
            this.tabIndex = (this.tabIndex + 1) % this.tabs.length;
            sound.playMenuHover();
            return true;
        }
        if (inputManager.justPressed('ArrowLeft') || inputManager.justPressed('KeyA')) {
            this.tabIndex = (this.tabIndex - 1 + this.tabs.length) % this.tabs.length;
            sound.playMenuHover();
            return true;
        }
        if (inputManager.justPressed('Digit1')) { this.tabIndex = 0; sound.playMenuHover(); return true; }
        if (inputManager.justPressed('Digit2')) { this.tabIndex = 1; sound.playMenuHover(); return true; }
        if (inputManager.justPressed('Digit3')) { this.tabIndex = 2; sound.playMenuHover(); return true; }
        if (inputManager.justPressed('Digit4')) { this.tabIndex = 3; sound.playMenuHover(); return true; }
        
        if (inputManager.justPressed('Escape') || inputManager.justPressed('Enter') || inputManager.justPressed('Space')) {
            sound.playMenuHover();
            this.uiManager.showScreen('menu');
            return true;
        }
        return false;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        super.render(ctx, canvasWidth, canvasHeight);
        ctx.save();
        
        const cx = canvasWidth / 2;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 30px "Outfit", "Space Grotesk", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('NEURAL ARCHITECTURE SPECIFICATION', cx, 52);
        
        ctx.font = '400 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Autonomous multi-agent algorithmic decision-making pipeline', cx, 84);
        
        const tabW = 140;
        const totalW = tabW * 4 + 30;
        const startX = cx - totalW / 2;
        const tabY = 110;
        
        for (let i = 0; i < this.tabs.length; i++) {
            const tx = startX + i * (tabW + 10);
            const isSelected = i === this.tabIndex;
            
            ctx.fillStyle = isSelected ? '#38BDF8' : 'rgba(30, 41, 59, 0.7)';
            this._roundRect(ctx, tx, tabY, tabW, 36, 8);
            ctx.fill();
            
            ctx.font = 'bold 12px "Space Grotesk", monospace';
            ctx.fillStyle = isSelected ? '#0B0F19' : '#94A3B8';
            ctx.textAlign = 'center';
            ctx.fillText(this.tabs[i].title, tx + tabW / 2, tabY + 18);
        }
        
        const content = this.tabs[this.tabIndex];
        const cardW = 680;
        const cardH = 260;
        const cardY = 165;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        this._roundRect(ctx, cx - cardW / 2, cardY, cardW, cardH, 14);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 20px "Outfit", sans-serif';
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(content.header, cx - cardW / 2 + 28, cardY + 36);
        
        const fBoxW = cardW - 56;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.7)';
        this._roundRect(ctx, cx - cardW / 2 + 28, cardY + 58, fBoxW, 44, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillStyle = '#10B981';
        ctx.fillText(content.formula, cx - cardW / 2 + 42, cardY + 80);
        
        const ptStartY = cardY + 128;
        ctx.font = '400 14px "Space Grotesk", sans-serif';
        for (let j = 0; j < content.points.length; j++) {
            const py = ptStartY + j * 38;
            ctx.fillStyle = '#38BDF8';
            ctx.fillText('\u25C6', cx - cardW / 2 + 32, py);
            ctx.fillStyle = '#CBD5E1';
            ctx.fillText(content.points[j], cx - cardW / 2 + 54, py);
        }
        
        ctx.textAlign = 'center';
        ctx.font = '500 12px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.fillText('\u2190 / \u2192 SWITCH TAB (OR 1-4) \u00B7 ESC / ENTER BACK TO MENU', cx, canvasHeight - 26);
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}

// -------------------------------------------------------------------------
// 5. Operator Manual (Tutorial Screen)
// -------------------------------------------------------------------------
class TutorialScreen extends UIScreen {
    update(deltaTime, inputManager) {
        super.update(deltaTime, inputManager);
        if (inputManager.justPressed('Escape') || inputManager.justPressed('Enter') || inputManager.justPressed('Space')) {
            sound.playMenuHover();
            this.uiManager.showScreen('menu');
            return true;
        }
        return false;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        super.render(ctx, canvasWidth, canvasHeight);
        ctx.save();
        
        const cx = canvasWidth / 2;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 32px "Outfit", "Space Grotesk", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('OPERATOR FLIGHT MANUAL', cx, 55);
        
        ctx.font = '400 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Core objectives, propulsion controls, and scoring mechanics', cx, 88);
        
        const colW = 320;
        const colH = 290;
        const colY = 125;
        
        // Left Column: Controls
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        this._roundRect(ctx, cx - colW - 14, colY, colW, colH, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.stroke();
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 18px "Outfit", sans-serif';
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('PILOT CONTROLS', cx - colW + 6, colY + 28);
        
        const controls = [
            { k: 'W A S D / Arrows', d: 'Omnidirectional thruster movement' },
            { k: 'P or ESC', d: 'Pause simulation' },
            { k: 'R', d: 'Restart current sector run' },
            { k: 'M', d: 'Toggle procedural synthesizer audio' },
            { k: 'F1', d: 'Toggle live neural path overlay' }
        ];
        
        for (let i = 0; i < controls.length; i++) {
            const cy = colY + 62 + i * 42;
            ctx.font = 'bold 12px "Space Grotesk", monospace';
            ctx.fillStyle = '#F8FAFC';
            ctx.fillText(controls[i].k, cx - colW + 6, cy);
            ctx.font = '400 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(controls[i].d, cx - colW + 6, cy + 18);
        }
        
        // Right Column: Relics
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        this._roundRect(ctx, cx + 14, colY, colW, colH, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.stroke();
        
        ctx.font = 'bold 18px "Outfit", sans-serif';
        ctx.fillStyle = '#10B981';
        ctx.fillText('RELIC MANIFEST & EXTRACTION', cx + 34, colY + 28);
        
        const relics = [
            { t: 'Gold Coin', v: '10 PTS', c: '#F59E0B', d: 'Common baseline currency' },
            { t: 'Sapphire Crystal', v: '25 PTS', c: '#38BDF8', d: 'High velocity value target' },
            { t: 'Ruby Gem', v: '50 PTS', c: '#F43F5E', d: 'Prized gemstone, contested' },
            { t: 'Celestial Relic', v: '100 PTS', c: '#A855F7', d: 'Legendary ancient core artifact' }
        ];
        
        for (let j = 0; j < relics.length; j++) {
            const ry = colY + 62 + j * 42;
            ctx.font = 'bold 13px "Outfit", sans-serif';
            ctx.fillStyle = relics[j].c;
            ctx.fillText(`\u25C6 ${relics[j].t}`, cx + 34, ry);
            ctx.font = 'bold 11px "Space Grotesk", monospace';
            ctx.fillText(`[ ${relics[j].v} ]`, cx + 220, ry);
            ctx.font = '400 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(relics[j].d, cx + 34, ry + 18);
        }
        
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        this._roundRect(ctx, cx + 30, colY + colH - 48, colW - 32, 34, 6);
        ctx.fill();
        ctx.font = 'bold 11px "Space Grotesk", monospace';
        ctx.fillStyle = '#10B981';
        ctx.fillText('WIN: Reach Target Score -> Extract at Portal', cx + 42, colY + colH - 26);
        
        ctx.textAlign = 'center';
        ctx.font = '500 12px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.fillText('PRESS ENTER, SPACE, OR ESC TO RETURN', cx, canvasHeight - 24);
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}

// -------------------------------------------------------------------------
// 6. Pause Screen
// -------------------------------------------------------------------------
class PauseScreen extends UIScreen {
    update(deltaTime, inputManager) {
        super.update(deltaTime, inputManager);
        
        if (inputManager.justPressed('KeyP') || inputManager.justPressed('Escape')) {
            sound.playMenuSelect();
            this.uiManager.showScreen('playing');
            return true;
        }
        if (inputManager.justPressed('KeyR')) {
            sound.playMenuSelect();
            if (typeof this.uiManager.onStartGame === 'function') {
                this.uiManager.onStartGame(this.uiManager.levelSelection, this.uiManager.getSelectedDifficulty());
            }
            return true;
        }
        if (inputManager.justPressed('KeyM')) {
            sound.playMenuHover();
            this.uiManager.showScreen('menu');
            return true;
        }
        return false;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        ctx.save();
        
        ctx.fillStyle = 'rgba(5, 8, 15, 0.8)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        const modalW = 440;
        const modalH = 260;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        this._roundRect(ctx, cx - modalW / 2, cy - modalH / 2, modalW, modalH, 16);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 28px "Outfit", "Space Grotesk", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('SIMULATION SUSPENDED', cx, cy - 65);
        
        ctx.font = '400 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('Game loop and agent ticks are currently halted', cx, cy - 35);
        
        const actions = [
            { k: 'P / ESC', d: 'RESUME OPERATION', c: '#38BDF8' },
            { k: 'R', d: 'RESTART SECTOR', c: '#F59E0B' },
            { k: 'M', d: 'RETURN TO MENU', c: '#94A3B8' }
        ];
        
        for (let i = 0; i < actions.length; i++) {
            const ay = cy + 10 + i * 38;
            ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
            this._roundRect(ctx, cx - 180, ay - 14, 360, 30, 6);
            ctx.fill();
            
            ctx.font = 'bold 12px "Space Grotesk", monospace';
            ctx.fillStyle = actions[i].c;
            ctx.textAlign = 'left';
            ctx.fillText(actions[i].k, cx - 165, ay);
            
            ctx.font = '600 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#E2E8F0';
            ctx.textAlign = 'right';
            ctx.fillText(actions[i].d, cx + 165, ay);
        }
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}

// -------------------------------------------------------------------------
// 7. Level Results Screen
// -------------------------------------------------------------------------
class LevelResultsScreen extends UIScreen {
    constructor(uiManager) {
        super(uiManager);
        this.results = null;
    }
    
    onShow(results) {
        super.onShow();
        this.results = results || {};
    }
    
    update(deltaTime, inputManager) {
        super.update(deltaTime, inputManager);
        
        if (inputManager.justPressed('Enter') || inputManager.justPressed('Space') || inputManager.justPressed('KeyN')) {
            sound.playMenuSelect();
            if (this.results && this.results.success) {
                const nextIdx = this.uiManager.levelSelection + 1;
                this.uiManager.setSelectedLevel(nextIdx % 3);
            }
            if (typeof this.uiManager.onStartGame === 'function') {
                this.uiManager.onStartGame(this.uiManager.levelSelection, this.uiManager.getSelectedDifficulty());
            }
            return true;
        }
        if (inputManager.justPressed('KeyR')) {
            sound.playMenuSelect();
            if (typeof this.uiManager.onStartGame === 'function') {
                this.uiManager.onStartGame(this.uiManager.levelSelection, this.uiManager.getSelectedDifficulty());
            }
            return true;
        }
        if (inputManager.justPressed('KeyM') || inputManager.justPressed('Escape')) {
            sound.playMenuHover();
            this.uiManager.showScreen('menu');
            return true;
        }
        return false;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        ctx.save();
        
        ctx.fillStyle = 'rgba(5, 8, 15, 0.85)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        const isSuccess = this.results && this.results.success;
        const score = this.results ? (this.results.score || 0) : 0;
        const target = this.results ? (this.results.targetScore || 80) : 80;
        
        const cardW = 500;
        const cardH = 340;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
        this._roundRect(ctx, cx - cardW / 2, cy - cardH / 2, cardW, cardH, 16);
        ctx.fill();
        
        ctx.strokeStyle = isSuccess ? '#10B981' : '#EF4444';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 36px "Outfit", "Space Grotesk", sans-serif';
        ctx.fillStyle = isSuccess ? '#10B981' : '#EF4444';
        ctx.fillText(isSuccess ? 'EXTRACTION SUCCESSFUL!' : 'MISSION COMPROMISED', cx, cy - 105);
        
        ctx.font = '500 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(isSuccess ? 'Target quota fulfilled. Portal extraction confirmed.' : 'Failed to reach portal before quota expiration.', cx, cy - 72);
        
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        this._roundRect(ctx, cx - 180, cy - 45, 360, 68, 10);
        ctx.fill();
        
        ctx.font = 'bold 14px "Space Grotesk", monospace';
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('FINAL HARVEST SCORE', cx, cy - 28);
        
        ctx.font = 'bold 32px "Outfit", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`${score} / ${target} PTS`, cx, cy + 4);
        
        const actions = isSuccess ? [
            { k: 'ENTER / N', d: 'ADVANCE TO NEXT SECTOR', c: '#10B981' },
            { k: 'R', d: 'REPLAY SECTOR', c: '#F59E0B' },
            { k: 'M', d: 'MAIN MENU', c: '#94A3B8' }
        ] : [
            { k: 'R / ENTER', d: 'RETRY SECTOR RUN', c: '#F59E0B' },
            { k: 'M', d: 'MAIN MENU', c: '#94A3B8' }
        ];
        
        for (let i = 0; i < actions.length; i++) {
            const ay = cy + 62 + i * 36;
            ctx.font = 'bold 12px "Space Grotesk", monospace';
            ctx.fillStyle = actions[i].c;
            ctx.textAlign = 'left';
            ctx.fillText(`[ ${actions[i].k} ]`, cx - 160, ay);
            
            ctx.font = '600 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#E2E8F0';
            ctx.textAlign = 'right';
            ctx.fillText(actions[i].d, cx + 160, ay);
        }
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}

// -------------------------------------------------------------------------
// 8. Game Complete Screen
// -------------------------------------------------------------------------
class GameCompleteScreen extends UIScreen {
    update(deltaTime, inputManager) {
        super.update(deltaTime, inputManager);
        if (inputManager.justPressed('Enter') || inputManager.justPressed('Space') || inputManager.justPressed('KeyM')) {
            sound.playMenuSelect();
            this.uiManager.showScreen('menu');
            return true;
        }
        return false;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        super.render(ctx, canvasWidth, canvasHeight);
        ctx.save();
        
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.font = 'bold 52px "Outfit", sans-serif';
        const grad = ctx.createLinearGradient(cx - 150, 0, cx + 150, 0);
        grad.addColorStop(0, '#F59E0B');
        grad.addColorStop(0.5, '#FCD34D');
        grad.addColorStop(1, '#10B981');
        ctx.fillStyle = grad;
        ctx.fillText('CAMPAIGN CONQUERED!', cx, cy - 60);
        
        ctx.font = 'bold 18px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('ALL DUNGEON SECTORS SECURED AGAINST THE AI HIVE', cx, cy - 10);
        
        ctx.font = '400 14px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('You outperformed autonomous heuristic agents across every tier.', cx, cy + 25);
        
        ctx.font = 'bold 13px "Space Grotesk", monospace';
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('PRESS ENTER OR SPACE TO RETURN TO THE ARENA MATRIX', cx, cy + 85);
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}
