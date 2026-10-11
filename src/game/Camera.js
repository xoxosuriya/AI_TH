// Camera system for world-to-screen transform and follow behavior
import { CONFIG } from '../config.js';

export class Camera {
    constructor(width = CONFIG.CANVAS_WIDTH, height = CONFIG.CANVAS_HEIGHT) {
        this.width = width || CONFIG.CANVAS_WIDTH; // Canvas width in pixels
        this.height = height || CONFIG.CANVAS_HEIGHT; // Canvas height in pixels
        
        // World position that the camera is centered on
        this.centerX = 0;
        this.centerY = 0;
        
        // Zoom/scale factor
        this.scale = 1.0;
        
        // World bounds (for clamping camera movement)
        this.worldWidth = 0;
        this.worldHeight = 0;
        this.hasBounds = false;
        
        // Target to follow (usually player)
        this.followTarget = null;
        this.followLerp = 0.1; // Smoothness of follow (0 = instant, 1 = no lag)
        
        // Screen shake effect
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.shakeDuration = 0;
        this.shakeIntensity = 0;
    }
    
    // Set the world bounds (in pixels)
    setWorldBounds(width, height) {
        this.worldWidth = width;
        this.worldHeight = height;
        this.hasBounds = true;
        
        // Initial center is middle of world
        this.centerX = width / 2;
        this.centerY = height / 2;
    }
    
    // Set target to follow
    follow(target) {
        if (typeof target === 'number') {
            this.centerX = target;
            if (arguments.length > 1 && typeof arguments[1] === 'number') {
                this.centerY = arguments[1];
            }
            if (arguments.length >= 4) {
                this.setWorldBounds(arguments[2], arguments[3]);
            }
            this.followTarget = null;
        } else {
            this.followTarget = target;
        }
    }
    
    // Stop following
    unfollow() {
        this.followTarget = null;
    }
    
    // Set follow smoothness (0-1)
    setFollowLerp(lerp) {
        this.followLerp = Math.max(0, Math.min(1, lerp));
    }
    
    // Trigger screen shake
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }
    
    // Update camera state
    update(deltaTime = 0.016) {
        // Update follow target
        if (this.followTarget) {
            const targetX = this.followTarget.position ? this.followTarget.position.x : (this.followTarget.x ?? this.centerX);
            const targetY = this.followTarget.position ? this.followTarget.position.y : (this.followTarget.y ?? this.centerY);
            
            // Smooth follow using lerp
            this.centerX += (targetX - this.centerX) * this.followLerp;
            this.centerY += (targetY - this.centerY) * this.followLerp;
        }
        
        // Apply world bounds if set
        if (this.hasBounds) {
            const halfWidth = this.width / this.scale / 2;
            const halfHeight = this.height / this.scale / 2;
            
            if (this.worldWidth <= this.width / this.scale) {
                this.centerX = this.worldWidth / 2;
            } else {
                const minX = halfWidth;
                const maxX = this.worldWidth - halfWidth;
                this.centerX = Math.max(minX, Math.min(maxX, this.centerX));
            }
            
            if (this.worldHeight <= this.height / this.scale) {
                this.centerY = this.worldHeight / 2;
            } else {
                const minY = halfHeight;
                const maxY = this.worldHeight - halfHeight;
                this.centerY = Math.max(minY, Math.min(maxY, this.centerY));
            }
        }
        
        // Update screen shake
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime * 1000; // Convert to milliseconds
            if (this.shakeDuration <= 0) {
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            } else {
                // Generate shake offset
                this.shakeOffsetX = (Math.random() * 2 - 1) * this.shakeIntensity;
                this.shakeOffsetY = (Math.random() * 2 - 1) * this.shakeIntensity;
            }
        } else {
            // No active shake
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }
    }
    
    // Convert world coordinates to screen coordinates
    worldToScreen(worldX, worldY) {
        // Apply camera transform:
        // 1. Translate world to camera space (subtract camera center)
        // 2. Apply scale
        // 3. Translate to screen space (add half canvas size)
        // 4. Apply shake offset
        
        const screenX = ((worldX - this.centerX) * this.scale) + this.width / 2 + this.shakeOffsetX;
        const screenY = ((worldY - this.centerY) * this.scale) + this.height / 2 + this.shakeOffsetY;
        
        return { x: screenX, y: screenY };
    }
    
    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        // Reverse of worldToScreen
        const worldX = ((screenX - this.width / 2 - this.shakeOffsetX) / this.scale) + this.centerX;
        const worldY = ((screenY - this.height / 2 - this.shakeOffsetY) / this.scale) + this.centerY;
        
        return { x: worldX, y: worldY };
    }
    
    // Get the visible world area (what's currently on screen)
    getVisibleWorld() {
        const topLeft = this.screenToWorld(0, 0);
        const bottomRight = this.screenToWorld(this.width, this.height);
        
        return {
            left: topLeft.x,
            top: topLeft.y,
            right: bottomRight.x,
            bottom: bottomRight.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };
    }
    
    // Reset camera to default state
    reset() {
        this.centerX = 0;
        this.centerY = 0;
        this.scale = 1.0;
        this.followTarget = null;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.shakeDuration = 0;
        this.shakeIntensity = 0;
        this.hasBounds = false;
        this.worldWidth = 0;
        this.worldHeight = 0;
    }
    
    // Set zoom level (with bounds checking)
    setZoom(zoom) {
        this.scale = Math.max(0.1, Math.min(3.0, zoom)); // Limit zoom to reasonable range
    }
    
    // Get current zoom level
    getZoom() {
        return this.scale;
    }
}

