// Input manager for handling keyboard input
export class InputManager {
    constructor() {
        this.keys = new Map(); // keyCode -> { pressed: boolean, justPressed: boolean, justReleased: boolean }
        this.keyStates = new Map(); // For tracking state changes
        
        // Bind event listeners
        window.addEventListener('keydown', this._onKeyDown.bind(this));
        window.addEventListener('keyup', this._onKeyUp.bind(this));
        window.addEventListener('blur', this._onWindowBlur.bind(this)); // Clear inputs when window loses focus
    }
    
    // Update input state (call each frame)
    update() {
        // Reset justPressed and justReleased flags
        for (const [keyCode, state] of this.keyStates.entries()) {
            state.justPressed = false;
            state.justReleased = false;
        }
    }
    
    // Check if a key is currently pressed
    isPressed(key) {
        const keyCode = this._getKeyCode(key);
        const state = this.keyStates.get(keyCode);
        return state ? state.pressed : false;
    }
    
    // Check if a key was just pressed (since last update)
    justPressed(key) {
        const keyCode = this._getKeyCode(key);
        const state = this.keyStates.get(keyCode);
        return state ? state.justPressed : false;
    }
    
    // Check if a key was just released (since last update)
    justReleased(key) {
        const keyCode = this._getKeyCode(key);
        const state = this.keyStates.get(keyCode);
        return state ? state.justReleased : false;
    }
    
    // Get any pressed keys (for debugging)
    getPressedKeys() {
        return Array.from(this.keyStates.entries())
            .filter(([_, state]) => state.pressed)
            .map(([keyCode]) => keyCode);
    }
    
    // Internal: Handle keydown event
    _onKeyDown(event) {
        // Prevent default for game keys to avoid scrolling etc.
        const gameKeys = ['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', 'p', 'escape', 'r', 'm', 'h', 'f1', 'n', 'enter'];
        if (event.key && gameKeys.includes(event.key.toLowerCase())) {
            event.preventDefault();
        }
        
        const keyCode = event.keyCode || this._getKeyCode(event.key);
        if (!keyCode) return;
        
        const state = this.keyStates.get(keyCode) || {
            pressed: false,
            justPressed: false,
            justReleased: false
        };
        
        if (!state.pressed) {
            state.justPressed = true;
        }
        state.pressed = true;
        
        this.keyStates.set(keyCode, state);
    }
    
    // Internal: Handle keyup event
    _onKeyUp(event) {
        const keyCode = event.keyCode || this._getKeyCode(event.key);
        if (!keyCode) return;
        
        const state = this.keyStates.get(keyCode) || {
            pressed: false,
            justPressed: false,
            justReleased: false
        };
        
        if (state.pressed) {
            state.justReleased = true;
        }
        state.pressed = false;
        
        this.keyStates.set(keyCode, state);
    }
    
    // Internal: Handle window losing focus
    _onWindowBlur() {
        // Clear all pressed states when window loses focus
        for (const state of this.keyStates.values()) {
            state.pressed = false;
            state.justPressed = false;
            state.justReleased = false;
        }
    }
    
    // Internal: Convert key string to keyCode
    _getKeyCode(key) {
        // Handle special keys
        const keyMap = {
            'w': 87,
            'a': 65,
            's': 83,
            'd': 68,
            'arrowup': 38,
            'arrowdown': 40,
            'arrowleft': 37,
            'arrowright': 39,
            ' ': 32,
            'space': 32,
            'enter': 13,
            'return': 13,
            'escape': 27,
            'esc': 27,
            'shift': 16,
            'control': 17,
            'alt': 18,
            'f1': 112,
            'p': 80,
            'r': 82,
            'm': 77,
            'h': 72,
            'n': 78
        };
        
        const lowerKey = key.toLowerCase();
        if (keyMap[lowerKey] !== undefined) {
            return keyMap[lowerKey];
        }
        
        // For single character keys, use charCodeAt(0) adjusted for keyCode
        if (key.length === 1) {
            return key.toUpperCase().charCodeAt(0);
        }
        
        // Fallback: try to get keyCode from the key directly
        // This might not work consistently across browsers for all keys
        return key.toUpperCase().charCodeAt(0);
    }
}

