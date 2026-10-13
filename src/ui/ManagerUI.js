// =========================================================================
// AI Treasure Hunter: Royal Artifact Edition — Canvas UI Manager
// Implements: Main Menu, Difficulty Select, 6-Level Gallery,
// AI Viva Compendium, Tutorial Manual, Pause, Results & Gilded HUD
// =========================================================================

import { sound } from '../utils/AudioSystem.js';
import { levels } from '../maps/levels.js';

export class UIManager {
    constructor() {
        this.currentScreen = null;
        this.screens = {};
        
        // UI State
        this.menuSelection = 0;
        this.difficultySelection = 1; // Knight (Medium) by default
        this.levelSelection = 0;
        this.countdownValue = 3;
        this.countdownTimer = 0;
        this.isCountdownActive = false;
        this.lastInputTime = 0;
        
        this._initializeScreens();
    }
    
    _initializeScreens() {
        this.screens.menu = new MenuScreen(this);
        this.screens.difficultySelect = new DifficultySelectScreen(this);
        this.screens.levelSelect = new LevelSelectScreen(this);
        this.screens.tutorial = new TutorialScreen(this);
        this.screens.howAIWorks = new HowAIWorksScreen(this);
        this.screens.pause = new PauseScreen(this);
        this.screens.levelResults = new LevelResultsScreen(this);
        this.screens.gameComplete = new GameCompleteScreen(this);
        
        this.currentScreen = this.screens.menu;
    }
    
    update(deltaTime, inputManager) {
        if (this.currentScreen && typeof this.currentScreen.update === 'function') {
            this.currentScreen.update(deltaTime, inputManager);
        }
        
        if (this.isCountdownActive) {
            this._updateCountdown(deltaTime);
        }
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        if (this.currentScreen && typeof this.currentScreen.render === 'function') {
            this.currentScreen.render(ctx, canvasWidth, canvasHeight);
        }
        
        if (this.isCountdownActive) {
            this._renderCountdown(ctx, canvasWidth, canvasHeight);
        }
    }
    
    renderHUD(ctx, canvasWidth, canvasHeight, gameState) {
        this._renderBasicHUD(ctx, canvasWidth, canvasHeight, gameState);
    }
    
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
        if (index >= 0 && index < levels.length) {
            this.levelSelection = index;
            return true;
        }
        return false;
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
        ctx.fillStyle = 'rgba(11, 10, 14, 0.82)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.05;
        
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 75 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.countdownValue > 0) {
            ctx.font = 'bold 76px "Cinzel", "Outfit", serif';
            ctx.fillStyle = '#FFF1D0';
            ctx.fillText(this.countdownValue, cx, cy);
            ctx.font = '600 14px "Space Grotesk", monospace';
            ctx.fillStyle = '#C6A15B';
            ctx.fillText('UNSEALING VAULT GATES...', cx, cy + 55);
        } else {
            ctx.font = 'bold 64px "Cinzel", "Outfit", serif';
            ctx.fillStyle = '#10B981';
            ctx.fillText('CLAIM THE GLORY!', cx, cy);
        }
        ctx.restore();
    }
    
    // In-game Royal HUD Banner
    _renderBasicHUD(ctx, canvasWidth, canvasHeight, gameState = {}) {
        ctx.save();
        
        const player = gameState.player;
        const aiAgents = gameState.aiAgents || [];
        const level = gameState.level || {};
        const targetScore = level.targetScore || 80;
        const playerScore = player ? player.score : 0;
        const isUnlocked = playerScore >= targetScore;
        const diffIndex = this.difficultySelection;
        const diffRanks = ['SQUIRE', 'KNIGHT', 'CHAMPION', 'SOVEREIGN'];
        const diffColors = ['#3895D3', '#10B981', '#C6A15B', '#E05252'];
        const diffRankName = diffRanks[diffIndex] || 'KNIGHT';
        const diffColor = diffColors[diffIndex] || '#10B981';
        
        // 1. Top Gilded Glass Header Bar
        const barH = 56;
        const grad = ctx.createLinearGradient(0, 0, 0, barH);
        grad.addColorStop(0, 'rgba(14, 12, 19, 0.95)');
        grad.addColorStop(1, 'rgba(20, 17, 27, 0.85)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, barH);
        
        // Fine Gilded Divider
        ctx.strokeStyle = 'rgba(198, 161, 91, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, barH);
        ctx.lineTo(canvasWidth, barH);
        ctx.stroke();
        
        // Left: Vault Sector & Threat Tag
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 16px "Cinzel", serif';
        ctx.fillStyle = '#FFF1D0';
        const levelTitle = level.name ? `VAULT ${level.number || this.getSelectedLevel()} \u00B7 ${level.name.toUpperCase()}` : `VAULT ${this.getSelectedLevel()}`;
        ctx.fillText(levelTitle, 22, 21);
        
        ctx.font = '600 11px "Space Grotesk", monospace';
        ctx.fillStyle = diffColor;
        ctx.fillText(`THREAT RANK: ${diffRankName}`, 22, 40);
        
        // Center: Quota Progress Bar & Exit Beacon Alert
        const barW = 300;
        const barX = (canvasWidth - barW) / 2;
        const barY = 16;
        const progress = Math.min(1, playerScore / targetScore);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        this._roundRect(ctx, barX, barY, barW, 14, 7);
        ctx.fill();
        ctx.strokeStyle = 'rgba(198, 161, 91, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        if (progress > 0) {
            const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
            fillGrad.addColorStop(0, '#C6A15B');
            fillGrad.addColorStop(1, isUnlocked ? '#10B981' : '#D4AF37');
            ctx.fillStyle = fillGrad;
            this._roundRect(ctx, barX, barY, Math.max(14, barW * progress), 14, 7);
            ctx.fill();
        }
        
        ctx.textAlign = 'center';
        ctx.font = 'bold 11px "Space Grotesk", monospace';
        if (isUnlocked) {
            const pulse = 0.7 + Math.sin(Date.now() * 0.01) * 0.3;
            ctx.fillStyle = `rgba(16, 185, 129, ${pulse})`;
            ctx.fillText(`\u2713 BEACON IGNITED \u00B7 HEAD TO EXIT PORTAL!`, canvasWidth / 2, 42);
        } else {
            ctx.fillStyle = '#E8D5A1';
            ctx.fillText(`QUOTA: ${playerScore} / ${targetScore} PTS (${Math.floor(progress * 100)}%)`, canvasWidth / 2, 42);
        }
        
        // Right: Real-time Rival Standings Deck
        const rightX = canvasWidth - 22;
        ctx.textAlign = 'right';
        ctx.font = 'bold 15px "Cinzel", serif';
        ctx.fillStyle = '#D4AF37';
        ctx.fillText(`YOU: ${playerScore} PTS`, rightX, 21);
        
        let topAI = null;
        for (const ai of aiAgents) {
            if (!topAI || ai.score > topAI.score) topAI = ai;
        }
        ctx.font = '500 12px "Space Grotesk", monospace';
        if (topAI) {
            const personas = ['LORD ALISTAIR', 'LADY VIVIENNE', 'SIR ROWAN', 'CORVUS'];
            const personaName = personas[(topAI.agentId - 1) % personas.length] || `RIVAL ${topAI.agentId}`;
            ctx.fillStyle = '#E05252';
            ctx.fillText(`${personaName}: ${topAI.score} PTS`, rightX, 40);
        } else {
            ctx.fillStyle = '#89818A';
            ctx.fillText(`RIVALS: 0`, rightX, 40);
        }
        
        // Bottom Ribbon: Controls
        ctx.textAlign = 'center';
        ctx.font = '500 11px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(232, 213, 161, 0.7)';
        ctx.fillText('WASD: MOVE \u00B7 P: PAUSE \u00B7 R: RESTART \u00B7 M: AUDIO \u00B7 F1: AI MESH', canvasWidth / 2, canvasHeight - 14);
        
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
        if (now - this.lastInputTime < 130) {
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
// Base Royal Screen
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
        
        // Deep obsidian to royal purple gradient
        const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, Math.max(w, h));
        bgGrad.addColorStop(0, '#191224');
        bgGrad.addColorStop(0.65, '#0E0C13');
        bgGrad.addColorStop(1, '#070609');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
        
        // Subtle antique gold grid filigree
        ctx.strokeStyle = 'rgba(198, 161, 91, 0.04)';
        ctx.lineWidth = 1;
        const gridSize = 54;
        const offsetX = (this.time * 6) % gridSize;
        const offsetY = (this.time * 6) % gridSize;
        
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
        
        // Ambient gilded radial lights
        const g1 = ctx.createRadialGradient(w * 0.2, h * 0.25, 10, w * 0.2, h * 0.25, 260);
        g1.addColorStop(0, 'rgba(198, 161, 91, 0.08)');
        g1.addColorStop(1, 'rgba(198, 161, 91, 0)');
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);
        
        const g2 = ctx.createRadialGradient(w * 0.8, h * 0.75, 10, w * 0.8, h * 0.75, 280);
        g2.addColorStop(0, 'rgba(40, 26, 56, 0.25)');
        g2.addColorStop(1, 'rgba(40, 26, 56, 0)');
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);
        
        // Gilded Ornate Corner Borders
        ctx.strokeStyle = 'rgba(198, 161, 91, 0.3)';
        ctx.lineWidth = 2;
        const cLen = 28;
        // Top Left
        ctx.beginPath(); ctx.moveTo(14, 14 + cLen); ctx.lineTo(14, 14); ctx.lineTo(14 + cLen, 14); ctx.stroke();
        // Top Right
        ctx.beginPath(); ctx.moveTo(w - 14 - cLen, 14); ctx.lineTo(w - 14, 14); ctx.lineTo(w - 14, 14 + cLen); ctx.stroke();
        // Bottom Left
        ctx.beginPath(); ctx.moveTo(14, h - 14 - cLen); ctx.lineTo(14, h - 14); ctx.lineTo(14 + cLen, h - 14); ctx.stroke();
        // Bottom Right
        ctx.beginPath(); ctx.moveTo(w - 14 - cLen, h - 14); ctx.lineTo(w - 14, h - 14); ctx.lineTo(w - 14, h - 14 - cLen); ctx.stroke();
        
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
// 1. Menu Screen — Royal Artifact Edition
// -------------------------------------------------------------------------
class MenuScreen extends UIScreen {
    constructor(uiManager) {
        super(uiManager);
        this.selectedIndex = 0;
        this.items = [
            { id: 'play', title: 'ENTER ROYAL EXPEDITION', subtitle: 'Descend into ancient vaults against autonomous rivals' },
            { id: 'difficulty', title: 'RIVAL THREAT MATRIX', subtitle: 'Calibrate rival hunter speed, perception & aggression' },
            { id: 'levels', title: 'IMPERIAL VAULT GALLERY', subtitle: 'Select from 6 handcrafted dungeon sectors' },
            { id: 'ai', title: 'HOW AI OPERATES', subtitle: 'Interactive academic compendium: A*, Utility & Kinematics' },
            { id: 'tutorial', title: 'EXPEDITION ARCHIVES', subtitle: 'Operator manual, controls & relic scoring manifest' }
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
        
        // Royal Badge
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '600 12px "Space Grotesk", monospace';
        ctx.fillStyle = '#C6A15B';
        ctx.fillText('\u25C6  ROYAL ARTIFACT EDITION \u2014 UNIT 3 AI IN GAMING  \u25C6', cx, 50);
        
        // Imperial Title
        ctx.font = 'bold 44px "Cinzel", "Outfit", serif';
        const titleGrad = ctx.createLinearGradient(cx - 240, 0, cx + 240, 0);
        titleGrad.addColorStop(0, '#FFF1D0');
        titleGrad.addColorStop(0.5, '#D4AF37');
        titleGrad.addColorStop(1, '#C6A15B');
        ctx.fillStyle = titleGrad;
        ctx.fillText('AI TREASURE HUNTER', cx, 96);
        
        // Royal Subtitle
        ctx.font = '500 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#A39B97';
        ctx.fillText('High-stakes multi-agent competition within the gilded subterranean vaults', cx, 134);
        
        // Menu Cards
        const cardW = 560;
        const cardH = 58;
        const startY = 175;
        const gap = 14;
        
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            const y = startY + i * (cardH + gap);
            const isSelected = i === this.selectedIndex;
            
            ctx.fillStyle = isSelected ? 'rgba(40, 26, 56, 0.75)' : 'rgba(20, 17, 27, 0.75)';
            this._roundRect(ctx, cx - cardW / 2, y, cardW, cardH, 10);
            ctx.fill();
            
            ctx.strokeStyle = isSelected ? '#D4AF37' : 'rgba(198, 161, 91, 0.2)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.stroke();
            
            if (isSelected) {
                ctx.fillStyle = '#D4AF37';
                this._roundRect(ctx, cx - cardW / 2 + 10, y + 14, 4, cardH - 28, 2);
                ctx.fill();
            }
            
            ctx.textAlign = 'left';
            ctx.font = isSelected ? 'bold 16px "Cinzel", serif' : '600 15px "Cinzel", serif';
            ctx.fillStyle = isSelected ? '#FFF1D0' : '#D1C7B7';
            ctx.fillText(item.title, cx - cardW / 2 + 28, y + 22);
            
            ctx.font = '400 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = isSelected ? '#E8D5A1' : '#89818A';
            ctx.fillText(item.subtitle, cx - cardW / 2 + 28, y + 42);
            
            if (isSelected) {
                ctx.textAlign = 'right';
                ctx.font = 'bold 18px "Cinzel", serif';
                ctx.fillStyle = '#D4AF37';
                ctx.fillText('\u2192', cx + cardW / 2 - 20, y + cardH / 2);
            }
        }
        
        ctx.textAlign = 'center';
        ctx.font = '500 12px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(232, 213, 161, 0.65)';
        ctx.fillText('\u2191 / \u2193 NAVIGATE \u00B7 ENTER / SPACE CONFIRM \u00B7 M MUTE', cx, canvasHeight - 26);
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}

// -------------------------------------------------------------------------
// 2. Difficulty Select Screen — 4 Royal Tiers
// -------------------------------------------------------------------------
class DifficultySelectScreen extends UIScreen {
    constructor(uiManager) {
        super(uiManager);
        this.selectedIndex = this.uiManager.difficultySelection || 1;
        this.options = [
            {
                title: 'SQUIRE',
                tag: 'EASY',
                color: '#3895D3',
                rivals: '1 AI Rival',
                speed: '90 px/s (350ms tick)',
                perception: '9 Tiles Perception',
                desc: 'Courteous adversary. AI favors safe distant relics, allowing ample time to learn the vault layout.'
            },
            {
                title: 'KNIGHT',
                tag: 'MEDIUM',
                color: '#10B981',
                rivals: '2 AI Rivals',
                speed: '110 px/s (250ms tick)',
                perception: '11 Tiles Perception',
                desc: 'Standard contest. Competitors deploy balanced utility weighting and basic target reservation.'
            },
            {
                title: 'CHAMPION',
                tag: 'HARD',
                color: '#C6A15B',
                rivals: '3 AI Rivals',
                speed: '125 px/s (180ms tick)',
                perception: '14 Tiles Perception',
                desc: 'Aggressive rivals. Agents actively monitor competitor distance and dynamically steal high-value targets.'
            },
            {
                title: 'SOVEREIGN',
                tag: 'EXTREME',
                color: '#E05252',
                rivals: '4 AI Rivals',
                speed: '140 px/s (140ms tick)',
                perception: '18 Tiles Perception',
                desc: 'Apex challenge. 4 synchronized competitors strip the vaults bare with rapid replanning and minimal hesitation.'
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
            this.uiManager.showScreen('menu');
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
        ctx.font = 'bold 34px "Cinzel", "Outfit", serif';
        ctx.fillStyle = '#FFF1D0';
        ctx.fillText('RIVAL THREAT MATRIX', cx, 56);
        
        ctx.font = '400 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#A39B97';
        ctx.fillText('Select your difficulty to tune AI speed, reaction intervals, and perception radii', cx, 88);
        
        const cardW = 600;
        const cardH = 88;
        const startY = 126;
        const gap = 16;
        
        for (let i = 0; i < this.options.length; i++) {
            const opt = this.options[i];
            const y = startY + i * (cardH + gap);
            const isSelected = i === this.selectedIndex;
            
            ctx.fillStyle = isSelected ? 'rgba(40, 26, 56, 0.85)' : 'rgba(20, 17, 27, 0.7)';
            this._roundRect(ctx, cx - cardW / 2, y, cardW, cardH, 10);
            ctx.fill();
            
            ctx.strokeStyle = isSelected ? opt.color : 'rgba(198, 161, 91, 0.2)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.stroke();
            
            ctx.fillStyle = opt.color;
            this._roundRect(ctx, cx - cardW / 2 + 12, y + 16, 4, cardH - 32, 2);
            ctx.fill();
            
            ctx.textAlign = 'left';
            ctx.font = 'bold 18px "Cinzel", serif';
            ctx.fillStyle = isSelected ? '#FFF1D0' : '#E8D5A1';
            ctx.fillText(opt.title, cx - cardW / 2 + 30, y + 24);
            
            ctx.font = 'bold 11px "Space Grotesk", monospace';
            ctx.fillStyle = opt.color;
            ctx.fillText(`[ ${opt.tag} ]`, cx - cardW / 2 + 165, y + 24);
            
            ctx.font = '500 12px "Space Grotesk", monospace';
            ctx.fillStyle = '#C6A15B';
            ctx.fillText(`\u25C6 ${opt.rivals}   \u25C6 ${opt.speed}   \u25C6 ${opt.perception}`, cx - cardW / 2 + 30, y + 46);
            
            ctx.font = '400 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#89818A';
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
        ctx.fillStyle = 'rgba(232, 213, 161, 0.7)';
        ctx.fillText('\u2191 / \u2193 SELECT \u00B7 ENTER CONFIRM \u00B7 ESC BACK', cx, canvasHeight - 24);
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}

// -------------------------------------------------------------------------
// 3. Level Select Screen — All 6 Handcrafted Vaults
// -------------------------------------------------------------------------
class LevelSelectScreen extends UIScreen {
    constructor(uiManager) {
        super(uiManager);
        this.selectedIndex = this.uiManager.levelSelection || 0;
    }
    
    update(deltaTime, inputManager) {
        super.update(deltaTime, inputManager);
        
        // 2-column grid navigation: left/right (±1), up/down (±2)
        if (inputManager.justPressed('ArrowRight') || inputManager.justPressed('KeyD')) {
            this.selectedIndex = (this.selectedIndex + 1) % levels.length;
            sound.playMenuHover();
            return true;
        }
        if (inputManager.justPressed('ArrowLeft') || inputManager.justPressed('KeyA')) {
            this.selectedIndex = (this.selectedIndex - 1 + levels.length) % levels.length;
            sound.playMenuHover();
            return true;
        }
        if (inputManager.justPressed('ArrowDown') || inputManager.justPressed('KeyS')) {
            this.selectedIndex = (this.selectedIndex + 2) % levels.length;
            sound.playMenuHover();
            return true;
        }
        if (inputManager.justPressed('ArrowUp') || inputManager.justPressed('KeyW')) {
            this.selectedIndex = (this.selectedIndex - 2 + levels.length) % levels.length;
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
        ctx.font = 'bold 32px "Cinzel", "Outfit", serif';
        ctx.fillStyle = '#FFF1D0';
        ctx.fillText('IMPERIAL VAULT EXPEDITION GALLERY', cx, 52);
        
        ctx.font = '400 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#A39B97';
        ctx.fillText('Browse all six handcrafted ancient dungeons & examine strategic target quotas', cx, 84);
        
        // 2 columns x 3 rows of rich cards
        const cardW = 380;
        const cardH = 114;
        const gapX = 24;
        const gapY = 16;
        const totalW = cardW * 2 + gapX;
        const startX = cx - totalW / 2;
        const startY = 118;
        
        for (let i = 0; i < levels.length; i++) {
            const lvl = levels[i];
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = startX + col * (cardW + gapX);
            const y = startY + row * (cardH + gapY);
            const isSelected = i === this.selectedIndex;
            const totalTreasureVal = lvl.treasures.reduce((s, t) => s + t.value, 0);
            
            ctx.fillStyle = isSelected ? 'rgba(40, 26, 56, 0.9)' : 'rgba(20, 17, 27, 0.72)';
            this._roundRect(ctx, x, y, cardW, cardH, 12);
            ctx.fill();
            
            ctx.strokeStyle = isSelected ? '#D4AF37' : 'rgba(198, 161, 91, 0.2)';
            ctx.lineWidth = isSelected ? 2 : 1;
            ctx.stroke();
            
            // Vertical accent bar
            ctx.fillStyle = isSelected ? '#D4AF37' : '#C6A15B';
            this._roundRect(ctx, x + 12, y + 14, 4, cardH - 28, 2);
            ctx.fill();
            
            // Title
            ctx.textAlign = 'left';
            ctx.font = 'bold 16px "Cinzel", serif';
            ctx.fillStyle = isSelected ? '#FFF1D0' : '#E8D5A1';
            ctx.fillText(`VAULT ${lvl.number}: ${lvl.name.toUpperCase()}`, x + 26, y + 24);
            
            // Metrics row
            ctx.font = '600 11px "Space Grotesk", monospace';
            ctx.fillStyle = '#10B981';
            ctx.fillText(`QUOTA: ${lvl.targetScore} PTS`, x + 26, y + 46);
            
            ctx.fillStyle = '#C6A15B';
            ctx.fillText(`\u25C6 ${lvl.timeLimit}s LIMIT`, x + 155, y + 46);
            
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(`\u25C6 ${lvl.treasures.length} RELICS (${totalTreasureVal} PTS)`, x + 235, y + 46);
            
            // Subtitle / Description
            ctx.font = '400 11px "Space Grotesk", sans-serif';
            ctx.fillStyle = isSelected ? '#D1C7B7' : '#89818A';
            const desc = lvl.subtitle || lvl.description;
            ctx.fillText(desc.length > 52 ? desc.slice(0, 52) + '...' : desc, x + 26, y + 68);
            
            ctx.font = 'italic 11px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#64748B';
            ctx.fillText(`Theme: ${lvl.theme ? lvl.theme.toUpperCase() : 'STONE'} \u00B7 Grid: ${lvl.width}x${lvl.height}`, x + 26, y + 90);
            
            if (isSelected) {
                ctx.textAlign = 'right';
                ctx.font = 'bold 13px "Cinzel", serif';
                ctx.fillStyle = '#D4AF37';
                ctx.fillText('ENTER \u2192', x + cardW - 14, y + 24);
            }
        }
        
        ctx.textAlign = 'center';
        ctx.font = '500 12px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(232, 213, 161, 0.7)';
        ctx.fillText('\u2190 \u2191 \u2192 \u2193 NAVIGATE \u00B7 ENTER ENTER EXPEDITION \u00B7 ESC RETURN', cx, canvasHeight - 22);
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}

// -------------------------------------------------------------------------
// 4. How AI Operates — Academic Viva Compendium
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
                    'The AI agent continuously scans surroundings up to a radius of 9 to 18 grid tiles.',
                    'Obstacles and dungeon walls obstruct line-of-sight using grid raycasting.',
                    'Treasures outside the field-of-view remain unseen until the agent travels closer.'
                ]
            },
            {
                title: '2. UTILITY EVALUATION',
                header: 'Multi-Factor Decision Function',
                formula: 'U(t) = w_val\u00B7V + w_dist\u00B7D + w_risk\u00B7R + w_comp\u00B7C + w_urg\u00B7U',
                points: [
                    'Every candidate relic is evaluated against a 5-factor normalized payoff formula.',
                    'Imperial crowns and gems (50-100 pts) are strategically weighted over common coins.',
                    'Competition modelling penalizes candidates if a rival or player is closer to the target.'
                ]
            },
            {
                title: '3. A* PATHFINDING',
                header: 'Optimal Grid Navigation (Min-Heap)',
                formula: 'f(n) = g(n) + h(n),  h(n) = |dx| + |dy| + 0.001 \u00B7 cross',
                points: [
                    'A* evaluates optimal waypoint corridors across the 64px collision grid in <1.2ms.',
                    'Binary Min-Heap priority queue guarantees O(log N) node extraction per cycle.',
                    'Dynamic replanning triggers whenever another hunter claims the target relic.'
                ]
            },
            {
                title: '4. STEERING DYNAMICS',
                header: 'Kinematic Separation & Trajectory Smoothing',
                formula: 'F_steer = v_desired - v_curr (Seek + Arrive + Avoid)',
                points: [
                    'Waypoints are followed via continuous steering forces instead of jerky grid snapping.',
                    'Separation avoidance forces prevent hunters from clipping through each other in chokepoints.',
                    'Sliding wall collision allows smooth deflection along stone corridors without sticking.'
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
        ctx.font = 'bold 30px "Cinzel", "Outfit", serif';
        ctx.fillStyle = '#FFF1D0';
        ctx.fillText('ACADEMIC AI COMPENDIUM', cx, 52);
        
        ctx.font = '400 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#A39B97';
        ctx.fillText('Deterministic multi-agent decision theory & algorithmic viva breakdown', cx, 84);
        
        const tabW = 150;
        const totalW = tabW * 4 + 30;
        const startX = cx - totalW / 2;
        const tabY = 110;
        
        for (let i = 0; i < this.tabs.length; i++) {
            const tx = startX + i * (tabW + 10);
            const isSelected = i === this.tabIndex;
            
            ctx.fillStyle = isSelected ? '#D4AF37' : 'rgba(20, 17, 27, 0.75)';
            this._roundRect(ctx, tx, tabY, tabW, 36, 8);
            ctx.fill();
            
            ctx.font = 'bold 12px "Space Grotesk", monospace';
            ctx.fillStyle = isSelected ? '#0B0A0E' : '#C6A15B';
            ctx.textAlign = 'center';
            ctx.fillText(this.tabs[i].title, tx + tabW / 2, tabY + 18);
        }
        
        const content = this.tabs[this.tabIndex];
        const cardW = 700;
        const cardH = 265;
        const cardY = 165;
        
        ctx.fillStyle = 'rgba(20, 17, 27, 0.9)';
        this._roundRect(ctx, cx - cardW / 2, cardY, cardW, cardH, 14);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(198, 161, 91, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 19px "Cinzel", serif';
        ctx.fillStyle = '#FFF1D0';
        ctx.fillText(content.header, cx - cardW / 2 + 28, cardY + 36);
        
        const fBoxW = cardW - 56;
        ctx.fillStyle = 'rgba(11, 10, 14, 0.7)';
        this._roundRect(ctx, cx - cardW / 2 + 28, cardY + 58, fBoxW, 44, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(198, 161, 91, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillStyle = '#6EE7B7';
        ctx.fillText(content.formula, cx - cardW / 2 + 42, cardY + 80);
        
        const ptStartY = cardY + 130;
        ctx.font = '400 14px "Space Grotesk", sans-serif';
        for (let j = 0; j < content.points.length; j++) {
            const py = ptStartY + j * 38;
            ctx.fillStyle = '#D4AF37';
            ctx.fillText('\u25C6', cx - cardW / 2 + 32, py);
            ctx.fillStyle = '#FDFBF7';
            ctx.fillText(content.points[j], cx - cardW / 2 + 54, py);
        }
        
        ctx.textAlign = 'center';
        ctx.font = '500 12px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(232, 213, 161, 0.7)';
        ctx.fillText('\u2190 / \u2192 SWITCH TAB (OR 1-4) \u00B7 ESC / ENTER BACK TO MENU', cx, canvasHeight - 26);
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}

// -------------------------------------------------------------------------
// 5. Operator Flight Manual (Tutorial Screen)
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
        ctx.font = 'bold 32px "Cinzel", "Outfit", serif';
        ctx.fillStyle = '#FFF1D0';
        ctx.fillText('ROYAL EXPEDITION ARCHIVES', cx, 55);
        
        ctx.font = '400 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#A39B97';
        ctx.fillText('Objective guidelines, locomotion controls, and relic valuation', cx, 88);
        
        const colW = 330;
        const colH = 300;
        const colY = 125;
        
        // Left Column: Controls
        ctx.fillStyle = 'rgba(20, 17, 27, 0.85)';
        this._roundRect(ctx, cx - colW - 14, colY, colW, colH, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(198, 161, 91, 0.25)';
        ctx.stroke();
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 17px "Cinzel", serif';
        ctx.fillStyle = '#FFF1D0';
        ctx.fillText('OPERATOR CONTROLS', cx - colW + 6, colY + 28);
        
        const controls = [
            { k: 'W A S D / Arrows', d: 'Omnidirectional character movement' },
            { k: 'P or ESC', d: 'Pause / Resume vault simulation' },
            { k: 'R', d: 'Restart current vault expedition' },
            { k: 'M', d: 'Toggle procedural acoustic synthesizer' },
            { k: 'F1', d: 'Toggle real-time AI decision & path mesh' }
        ];
        
        for (let i = 0; i < controls.length; i++) {
            const cy = colY + 62 + i * 44;
            ctx.font = 'bold 12px "Space Grotesk", monospace';
            ctx.fillStyle = '#D4AF37';
            ctx.fillText(controls[i].k, cx - colW + 6, cy);
            ctx.font = '400 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#A39B97';
            ctx.fillText(controls[i].d, cx - colW + 6, cy + 18);
        }
        
        // Right Column: Relics
        ctx.fillStyle = 'rgba(20, 17, 27, 0.85)';
        this._roundRect(ctx, cx + 14, colY, colW, colH, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(198, 161, 91, 0.25)';
        ctx.stroke();
        
        ctx.font = 'bold 17px "Cinzel", serif';
        ctx.fillStyle = '#10B981';
        ctx.fillText('RELIC MANIFEST & QUOTA', cx + 34, colY + 28);
        
        const relics = [
            { t: 'Ancient Coin', v: '10 PTS', c: '#C6A15B', d: 'Common imperial coin with royal crest' },
            { t: 'Gilded Ingot', v: '25 PTS', c: '#EAB308', d: 'Heavy gold bullion bar' },
            { t: 'Royal Emerald', v: '50 PTS', c: '#10B981', d: 'Radiant cut dynastic gemstone' },
            { t: 'Imperial Crown', v: '100 PTS', c: '#D4AF37', d: 'Legendary sovereign coronation artifact' }
        ];
        
        for (let j = 0; j < relics.length; j++) {
            const ry = colY + 62 + j * 42;
            ctx.font = 'bold 13px "Cinzel", serif';
            ctx.fillStyle = relics[j].c;
            ctx.fillText(`\u25C6 ${relics[j].t}`, cx + 34, ry);
            ctx.font = 'bold 11px "Space Grotesk", monospace';
            ctx.fillText(`[ ${relics[j].v} ]`, cx + 225, ry);
            ctx.font = '400 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#A39B97';
            ctx.fillText(relics[j].d, cx + 34, ry + 18);
        }
        
        ctx.fillStyle = 'rgba(77, 156, 119, 0.15)';
        this._roundRect(ctx, cx + 30, colY + colH - 52, colW - 32, 36, 6);
        ctx.fill();
        ctx.font = 'bold 11px "Space Grotesk", monospace';
        ctx.fillStyle = '#6EE7B7';
        ctx.fillText('WIN: Reach Target Quota -> Extract at Portal', cx + 42, colY + colH - 28);
        
        ctx.textAlign = 'center';
        ctx.font = '500 12px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(232, 213, 161, 0.7)';
        ctx.fillText('PRESS ENTER, SPACE, OR ESC TO RETURN', cx, canvasHeight - 22);
        
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
        
        ctx.fillStyle = 'rgba(11, 10, 14, 0.85)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        const modalW = 460;
        const modalH = 265;
        
        ctx.fillStyle = 'rgba(20, 17, 27, 0.96)';
        this._roundRect(ctx, cx - modalW / 2, cy - modalH / 2, modalW, modalH, 16);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(198, 161, 91, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 28px "Cinzel", "Outfit", serif';
        ctx.fillStyle = '#FFF1D0';
        ctx.fillText('EXPEDITION SUSPENDED', cx, cy - 65);
        
        ctx.font = '400 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#A39B97';
        ctx.fillText('Vault physics and AI decision loops are paused', cx, cy - 35);
        
        const actions = [
            { k: 'P / ESC', d: 'RESUME EXPEDITION', c: '#D4AF37' },
            { k: 'R', d: 'RESTART VAULT RUN', c: '#EAB308' },
            { k: 'M', d: 'RETURN TO MAIN MENU', c: '#A39B97' }
        ];
        
        for (let i = 0; i < actions.length; i++) {
            const ay = cy + 12 + i * 40;
            ctx.fillStyle = 'rgba(40, 26, 56, 0.6)';
            this._roundRect(ctx, cx - 185, ay - 14, 370, 32, 6);
            ctx.fill();
            
            ctx.font = 'bold 12px "Space Grotesk", monospace';
            ctx.fillStyle = actions[i].c;
            ctx.textAlign = 'left';
            ctx.fillText(actions[i].k, cx - 170, ay);
            
            ctx.font = '600 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#FDFBF7';
            ctx.textAlign = 'right';
            ctx.fillText(actions[i].d, cx + 170, ay);
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
                const nextIdx = (this.uiManager.levelSelection + 1) % levels.length;
                this.uiManager.setSelectedLevel(nextIdx);
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
        
        ctx.fillStyle = 'rgba(11, 10, 14, 0.88)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        const isSuccess = this.results && this.results.success;
        const score = this.results ? (this.results.score || 0) : 0;
        const target = this.results ? (this.results.targetScore || 80) : 80;
        
        const cardW = 520;
        const cardH = 345;
        
        ctx.fillStyle = 'rgba(20, 17, 27, 0.96)';
        this._roundRect(ctx, cx - cardW / 2, cy - cardH / 2, cardW, cardH, 16);
        ctx.fill();
        
        ctx.strokeStyle = isSuccess ? '#10B981' : '#E05252';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 36px "Cinzel", "Outfit", serif';
        ctx.fillStyle = isSuccess ? '#10B981' : '#E05252';
        ctx.fillText(isSuccess ? 'VICTORY ACHIEVED!' : 'EXPEDITION FAILED', cx, cy - 105);
        
        ctx.font = '500 13px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#A39B97';
        ctx.fillText(isSuccess ? 'Royal quota fulfilled! Extraction portal successfully breached.' : 'Target quota unreached before vault time limit expired.', cx, cy - 72);
        
        ctx.fillStyle = 'rgba(40, 26, 56, 0.7)';
        this._roundRect(ctx, cx - 190, cy - 45, 380, 68, 10);
        ctx.fill();
        
        ctx.font = 'bold 13px "Space Grotesk", monospace';
        ctx.fillStyle = '#D4AF37';
        ctx.fillText('FINAL HARVEST SCORE', cx, cy - 28);
        
        ctx.font = 'bold 30px "Cinzel", serif';
        ctx.fillStyle = '#FFF1D0';
        ctx.fillText(`${score} / ${target} PTS`, cx, cy + 4);
        
        const actions = isSuccess ? [
            { k: 'ENTER / N', d: 'ADVANCE TO NEXT VAULT', c: '#10B981' },
            { k: 'R', d: 'REPLAY CURRENT VAULT', c: '#C6A15B' },
            { k: 'M', d: 'RETURN TO MAIN MENU', c: '#A39B97' }
        ] : [
            { k: 'R / ENTER', d: 'RETRY VAULT RUN', c: '#EAB308' },
            { k: 'M', d: 'MAIN MENU', c: '#A39B97' }
        ];
        
        for (let i = 0; i < actions.length; i++) {
            const ay = cy + 62 + i * 36;
            ctx.font = 'bold 12px "Space Grotesk", monospace';
            ctx.fillStyle = actions[i].c;
            ctx.textAlign = 'left';
            ctx.fillText(`[ ${actions[i].k} ]`, cx - 170, ay);
            
            ctx.font = '600 12px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#FDFBF7';
            ctx.textAlign = 'right';
            ctx.fillText(actions[i].d, cx + 170, ay);
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
        
        ctx.font = 'bold 50px "Cinzel", "Outfit", serif';
        const grad = ctx.createLinearGradient(cx - 200, 0, cx + 200, 0);
        grad.addColorStop(0, '#C6A15B');
        grad.addColorStop(0.5, '#FFF1D0');
        grad.addColorStop(1, '#D4AF37');
        ctx.fillStyle = grad;
        ctx.fillText('SOVEREIGN CONQUEST!', cx, cy - 60);
        
        ctx.font = 'bold 18px "Cinzel", sans-serif';
        ctx.fillStyle = '#FDFBF7';
        ctx.fillText('ALL SIX IMPERIAL VAULTS SECURED AGAINST THE AI RIVALS', cx, cy - 10);
        
        ctx.font = '400 14px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#A39B97';
        ctx.fillText('You outperformed autonomous heuristic hunters across every dynastic trial.', cx, cy + 25);
        
        ctx.font = 'bold 13px "Space Grotesk", monospace';
        ctx.fillStyle = '#D4AF37';
        ctx.fillText('PRESS ENTER OR SPACE TO RETURN TO THE ROYAL ARCHIVES', cx, cy + 85);
        
        ctx.restore();
    }
    
    handleInput(inputManager) {
        return this.update(0, inputManager);
    }
}
