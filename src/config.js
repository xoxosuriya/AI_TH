// Game configuration and constants
export const CONFIG = {
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    TILE_SIZE: 64,
    
    PLAYER: {
        RADIUS: 18,
        SPEED: 180,
        ACCELERATION: 1000,
        COLOR: '#3498DB'
    },
    
    TREASURE_TYPES: {
        coin: { value: 10, color: '#FFD700', shape: 'circle' },
        gold: { value: 25, color: '#FFA500', shape: 'diamond' },
        gem: { value: 50, color: '#00E5FF', shape: 'hexagon' },
        artifact: { value: 100, color: '#E040FB', shape: 'star' }
    },
    
    DIFFICULTIES: {
        easy: {
            name: 'Easy',
            aiCount: 1,
            speed: 90,
            decisionInterval: 350,
            perceptionRadius: 9,
            timerMultiplier: 1.4
        },
        medium: {
            name: 'Medium',
            aiCount: 2,
            speed: 110,
            decisionInterval: 250,
            perceptionRadius: 11,
            timerMultiplier: 1.0
        },
        hard: {
            name: 'Hard',
            aiCount: 3,
            speed: 125,
            decisionInterval: 180,
            perceptionRadius: 14,
            timerMultiplier: 0.75
        },
        extreme: {
            name: 'Extreme',
            aiCount: 4,
            speed: 140,
            decisionInterval: 140,
            perceptionRadius: 18,
            timerMultiplier: 0.60
        }
    },
    
    GAME_STATES: {
        BOOT: 'BOOT',
        MENU: 'MENU',
        DIFFICULTY_SELECT: 'DIFFICULTY_SELECT',
        LEVEL_SELECT: 'LEVEL_SELECT',
        TUTORIAL: 'TUTORIAL',
        HOW_AI_WORKS: 'HOW_AI_WORKS',
        PAUSED: 'PAUSED',
        LEVEL_COMPLETE: 'LEVEL_COMPLETE',
        LEVEL_FAILED: 'LEVEL_FAILED',
        GAME_COMPLETE: 'GAME_COMPLETE',
        LOADING_LEVEL: 'LOADING_LEVEL',
        COUNTDOWN: 'COUNTDOWN',
        PLAYING: 'PLAYING'
    },
    
    DEBUG: {
        SHOW_GRID: false,
        SHOW_PATHS: false,
        SHOW_STATES: false,
        SHOW_PERCEPTION: false,
        SHOW_UTILITY: false,
        SHOW_STEERING: false
    }
};

// Aliases for uppercase access
CONFIG.DIFFICULTIES.EASY = CONFIG.DIFFICULTIES.easy;
CONFIG.DIFFICULTIES.MEDIUM = CONFIG.DIFFICULTIES.medium;
CONFIG.DIFFICULTIES.HARD = CONFIG.DIFFICULTIES.hard;
CONFIG.DIFFICULTIES.EXTREME = CONFIG.DIFFICULTIES.extreme;

export default CONFIG;
