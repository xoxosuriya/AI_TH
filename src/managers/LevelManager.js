// Level manager - handles level progression, unlocking, and level data
export class LevelManager {
    constructor() {
        // Level data array
        this.levels = [];
        
        // Current level index
        this.currentLevelIndex = 0;
        
        // Unlocked levels (array of booleans)
        this.unlockedLevels = [];
        
        // Persistent storage key
        this.STORAGE_KEY = 'ai_treasure_hunter_unlocked_levels';
        
        // Load unlocked levels from storage
        this._loadUnlockedLevels();
    }
    
    // Load all level data
    loadLevels(levelDataArray) {
        this.levels = [...levelDataArray];
        
        // Initialize unlocked levels array
        this.unlockedLevels = Array(this.levels.length).fill(false);
        
        // Always unlock first level
        if (this.levels.length > 0) {
            this.unlockedLevels[0] = true;
        }
        
        // Apply saved unlocked levels
        this._applyUnlockedLevels();
    }
    
    // Get current level data
    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }
    
    // Get total number of levels
    getLevelCount() {
        return this.levels.length;
    }
    
    // Check if there is a next level
    hasNextLevel() {
        return this.currentLevelIndex < this.levels.length - 1;
    }
    
    // Go to next level
    nextLevel() {
        if (this.hasNextLevel()) {
            this.currentLevelIndex++;
            return true;
        }
        return false;
    }
    
    // Unlock a level (by index)
    unlockLevel(levelIndex) {
        if (levelIndex >= 0 && levelIndex < this.levels.length) {
            this.unlockedLevels[levelIndex] = true;
            this._saveUnlockedLevels();
            return true;
        }
        return false;
    }
    
    // Check if a level is unlocked
    isLevelUnlocked(levelIndex) {
        if (levelIndex >= 0 && levelIndex < this.levels.length) {
            return this.unlockedLevels[levelIndex];
        }
        return false;
    }
    
    // Get array of unlocked level numbers (1-based)
    getUnlockedLevelNumbers() {
        return this.unlockedLevels
            .map((unlocked, index) => unlocked ? index + 1 : 0)
            .filter(num => num > 0);
    }
    
    // Reset progress (lock all levels except first)
    resetProgress() {
        this.unlockedLevels = Array(this.levels.length).fill(false);
        if (this.levels.length > 0) {
            this.unlockedLevels[0] = true;
        }
        this._saveUnlockedLevels();
    }
    
    // Load unlocked levels from persistent storage
    _loadUnlockedLevels() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    this.unlockedLevels = parsed;
                }
            }
        } catch (error) {
            console.warn('Failed to load unlocked levels from storage:', error);
        }
    }
    
    // Save unlocked levels to persistent storage
    _saveUnlockedLevels() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.unlockedLevels));
        } catch (error) {
            console.warn('Failed to save unlocked levels to storage:', error);
        }
    }
    
    // Apply saved unlocked levels (called after loading levels)
    _applyUnlockedLevels() {
        // Ensure we don't have more unlocked levels than actual levels
        if (this.unlockedLevels.length > this.levels.length) {
            this.unlockedLevels.length = this.levels.length;
        }
        
        // Ensure first level is always unlocked
        if (this.levels.length > 0) {
            this.unlockedLevels[0] = true;
        }
    }
}

