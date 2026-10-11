import { Game } from './game/Game.js';
import { AssetLoader } from './rendering/AssetLoader.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBarFill = document.getElementById('loadingBarFill');
    const loadingText = document.getElementById('loadingText');
    
    // Initialize asset loader\n    console.log('AssetLoader created');
    const assetLoader = new AssetLoader();
    assetLoader.onProgress((progress) => {
        console.log('AssetLoader progress:', progress);
        const percent = Math.round(progress.overall * 100);
        loadingBarFill.style.width = percent + '%';
        loadingText.textContent = percent + '%';
    });
    assetLoader.onComplete(() => {
        console.log('AssetLoader complete');
        // Ensure final update
        loadingBarFill.style.width = '100%';
        loadingText.textContent = '100%';
    });
    
    // Load all required assets
    assetLoader.loadAllAssets()
        .then(() => {
            console.log('Assets loaded, starting game');
            // Hide loading screen\n        console.log('Assets loaded, hiding loading screen');
            loadingScreen.style.display = 'none';
            
            // Initialize and start the game
            const game = new Game(canvas, assetLoader);
            window.game = game;
            game.start().catch(err => { console.error('Game start error:', err); });
        })
        .catch(error => {
            console.error('Failed to load assets:', error);
            loadingText.textContent = 'Failed to load assets!';
            loadingText.style.color = '#f44336';
        });
});
