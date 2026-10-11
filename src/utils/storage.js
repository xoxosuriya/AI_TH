// Storage manager - handles localStorage for persistent data
export class StorageManager {
    constructor() {
        // Storage keys
        this.KEYS = {
            UNLOCKED_LEVELS: 'ai_treasure_hunter_unlocked_levels',
            LAST_DIFFICULTY: 'ai_treasure_hunter_last_difficulty',
            SOUND_ENABLED: 'ai_treasure_hunter_sound_enabled',
            DEBUG_ENABLED: 'ai_treasure_hunter_debug_enabled',
            BEST_SCORES: 'ai_treasure_hunter_best_scores'
        };
        
        // Default values
        this.DEFAULTS = {
            [this.KEYS.LAST_DIFFICULTY]: 'medium',
            [this.KEYS.SOUND_ENABLED]: true,
            [this.KEYS.DEBUG_ENABLED]: false
        };
    }
    
    // Save data to localStorage
    save(key, value) {
        try {
            if (value === null || value === undefined) {
                localStorage.removeItem(key);
            } else if (typeof value === 'object') {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                localStorage.setItem(key, String(value));
            }
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', key, error);
            return false;
        }
    }
    
    // Load data from localStorage
    load(key, defaultValue) {
        try {
            const value = localStorage.getItem(key);
            
            if (value === null) {
                return defaultValue !== undefined ? defaultValue : null;
            }
            
            // Try to parse as JSON
            try {
                return JSON.parse(value);
            } catch (e) {
                // Return as string if not valid JSON
                return value;
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', key, error);
            return defaultValue !== undefined ? defaultValue : null;
        }
    }
    
    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Failed to remove from localStorage:', key, error);
            return false;
        }
    }
    
    // Clear all game-related storage
    clear() {
        try {
            // Clear specific keys
            for (const key of Object.values(this.KEYS)) {
                localStorage.removeItem(key);
            }
            
            // Alternatively, clear all matching prefix (more dangerous)
            // const keysToRemove = [];
            // for (let i = 0; i < localStorage.length; i++) {
            //     const key = localStorage.key(i);
            //     if (key.startsWith('ai_treasure_hunter_')) {
            //         keysToRemove.push(key);
            //     }
            // }
            // for (const key of keysToRemove) {
            //     localStorage.removeItem(key);
            // }
            
            return true;
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
            return false;
        }
    }
    
    // Get unlocked levels from storage
    getUnlockedLevels() {
        return this.load(this.KEYS.UNLOCKED_LEVELS, []);
    }
    
    // Save unlocked levels to storage
    saveUnlockedLevels(levels) {
        return this.save(this.KEYS.UNLOCKED_LEVELS, levels);
    }
    
    // Get last selected difficulty
    getLastDifficulty() {
        return this.load(this.KEYS.LAST_DIFFICULTY, this.DEFAULTS[this.KEYS.LAST_DIFFICULTY]);
    }
    
    // Save last selected difficulty
    saveLastDifficulty(difficulty) {
        return this.save(this.KEYS.LAST_DIFFICULTY, difficulty);
    }
    
    // Get sound enabled setting
    getSoundEnabled() {
        return this.load(this.KEYS.SOUND_ENABLED, this.DEFAULTS[this.KEYS.SOUND_ENABLED]);
    }
    
    // Save sound enabled setting
    saveSoundEnabled(enabled) {
        return this.save(this.KEYS.SOUND_ENABLED, enabled);
    }
    
    // Get debug enabled setting
    getDebugEnabled() {
        return this.load(this.KEYS.DEBUG_ENABLED, this.DEFAULTS[this.KEYS.DEBUG_ENABLED]);
    }
    
    // Save debug enabled setting
    saveDebugEnabled(enabled) {
        return this.save(this.KEYS.DEBUG_ENABLED, enabled);
    }
    
    // Get best score for a level/difficulty combination
    getBestScore(levelNumber, difficulty) {
        const key = `${this.KEYS.BEST_SCORES}:${levelNumber}:${difficulty}`;
        return this.load(key, 0);
    }
    
    // Save best score for a level/difficulty combination
    saveBestScore(levelNumber, difficulty, score) {
        const key = `${this.KEYS.BEST_SCORES}:${levelNumber}:${difficulty}`;
        const currentBest = this.getBestScore(levelNumber, difficulty);
        if (score > currentBest) {
            return this.save(key, score);
        }
        return false; // Didn't update best score
    }
    
    // Get all best scores
    getAllBestScores() {
        const bestScores = {};
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.KEYS.BEST_SCORES + ':')) {
                    const parts = key.split(':');
                    if (parts.length >= 3) {
                        const levelNumber = parseInt(parts[1]);
                        const difficulty = parts[2];
                        const score = parseInt(localStorage.getItem(key)) || 0;
                        
                        if (!bestScores[levelNumber]) {
                            bestScores[levelNumber] = {};
                        }
                        bestScores[levelNumber][difficulty] = score;
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to get all best scores:', error);
        }
        return bestScores;
    }
}

