// Generic Finite State Machine for AI agents
export class StateMachine {
    constructor() {
        this.state = null;
        this.previousState = null;
        this.stateHistory = []; // For debugging and replanning logic
        this.stateTimers = new Map(); // Time spent in each state
        this.stateEnterTime = 0;
    }
    
    // Change to a new state
    changeState(newState) {
        const currentTime = performance.now();
        
        // Record time spent in current state
        if (this.state !== null) {
            const timeInState = currentTime - this.stateEnterTime;
            this.stateTimers.set(this.state, (this.stateTimers.get(this.state) || 0) + timeInState);
        }
        
        // Update history
        this.stateHistory.push({
            state: this.state,
            timestamp: currentTime,
            duration: this.state !== null ? currentTime - this.stateEnterTime : 0
        });
        
        // Limit history size
        if (this.stateHistory.length > 50) {
            this.stateHistory.shift();
        }
        
        // Change state
        this.previousState = this.state;
        this.state = newState;
        this.stateEnterTime = currentTime;
        
        // Initialize timers for new state if not exists
        if (!this.stateTimers.has(this.state)) {
            this.stateTimers.set(this.state, 0);
        }
        
        return { previousState: this.previousState, newState: this.state };
    }
    
    // Get current state
    getCurrentState() {
        return this.state;
    }
    
    // Get previous state
    getPreviousState() {
        return this.previousState;
    }
    
    // Check if currently in a specific state
    isInState(state) {
        return this.state === state;
    }
    
    // Check if was in a specific state (history)
    wasInState(state) {
        return this.stateHistory.some(entry => entry.state === state);
    }
    
    // Get time spent in current state
    getTimeInCurrentState() {
        if (this.state === null) return 0;
        return performance.now() - this.stateEnterTime;
    }
    
    // Get total time spent in a specific state
    getTimeInState(state) {
        return this.stateTimers.get(state) || 0;
    }
    
    // Get state history (for debugging)
    getStateHistory() {
        return [...this.stateHistory];
    }
    
    // Reset state machine
    reset() {
        this.state = null;
        this.previousState = null;
        this.stateHistory = [];
        this.stateTimers.clear();
        this.stateEnterTime = 0;
    }
}

