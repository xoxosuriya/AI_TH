// Timer system - handles game timing and countdowns
export class TimerSystem {
    constructor() {
        this.timeRemaining = 0;
        this.initialTime = 0;
        this.isPaused = false;
        this.hasStarted = false;
    }
    
    // Reset timer with initial time (in seconds)
    reset(initialTime) {
        this.initialTime = initialTime;
        this.timeRemaining = initialTime;
        this.isPaused = false;
        this.hasStarted = false;
    }
    
    // Start the timer
    start() {
        this.hasStarted = true;
        this.isPaused = false;
    }
    
    // Pause the timer
    pause() {
        this.isPaused = true;
    }
    
    // Resume the timer
    resume() {
        this.isPaused = false;
    }
    
    // Update timer
    update(deltaTime, isPausedOverride = false) {
        // Use override if provided, otherwise use internal state
        const effectivePaused = isPausedOverride !== undefined ? isPausedOverride : this.isPaused;
        
        if (!this.hasStarted || effectivePaused) {
            return; // Don't update if not started or paused
        }
        
        // Decrease time remaining
        this.timeRemaining -= deltaTime;
        
        // Clamp at zero
        if (this.timeRemaining < 0) {
            this.timeRemaining = 0;
        }
    }
    
    // Get time remaining (in seconds)
    getTimeRemaining() {
        return Math.max(0, this.timeRemaining);
    }
    
    // Get initial time
    getInitialTime() {
        return this.initialTime;
    }
    
    // Check if timer has expired
    isExpired() {
        return this.timeRemaining <= 0;
    }
    
    // Get progress (0-1)
    getProgress() {
        if (this.initialTime === 0) {
            return 0;
        }
        return Math.min(1, Math.max(0, 1 - (this.timeRemaining / this.initialTime)));
    }
    
    // Format time as MM:SS
    formatTime() {
        const totalSeconds = Math.floor(this.timeRemaining);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
}

