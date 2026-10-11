// Base Entity class for all game objects
export class Entity {
    constructor(x, y, type, options = {}) {
        // Position (in pixels)
        this.position = { x: x, y: y };
        
        // Previous position (for collision resolution)
        this.previousPosition = { x: x, y: y };
        
        // Velocity (pixels per second)
        this.velocity = { x: 0, y: 0 };
        
        // Acceleration (pixels per second^2)
        this.acceleration = { x: 0, y: 0 };
        
        // Type identifier
        this.type = type;
        
        // Unique ID
        this.id = options.id || `${type}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Physical properties
        this.radius = options.radius || 16; // pixels
        this.maxSpeed = options.maxSpeed || 100; // pixels per second
        this.maxForce = options.maxForce || 10; // pixels per second^2 (steering force)
        
        // Visual properties
        this.color = options.color || '#FFFFFF';
        this.visible = options.visible !== undefined ? options.visible : true;
        
        // State flags
        this.active = options.active !== undefined ? options.active : true;
        this.collected = options.collected || false; // For collectibles
        
        // For AI agents
        this.agentId = options.agentId || null;
    }
    
    // Update position based on velocity and acceleration
    update(deltaTime) {
        // Store previous position for collision resolution
        this.previousPosition = { x: this.position.x, y: this.position.y };
        
        // Update velocity with acceleration
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        
        // Apply velocity to position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Reset acceleration (force-based system)
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }
    
    // Apply a force (acceleration = force / mass, assuming mass = 1 for simplicity)
    applyForce(force) {
        this.acceleration.x += force.x;
        this.acceleration.y += force.y;
    }
    
    // Check if this entity overlaps with another (circular collision)
    overlaps(other) {
        if (!this.active || !other.active) {
            return false;
        }
        
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (this.radius + other.radius);
    }
    
    // Distance to another entity or point
    distanceTo(other) {
        if (!other) return Infinity;
        const targetX = other.position !== undefined ? other.position.x : other.x;
        const targetY = other.position !== undefined ? other.position.y : other.y;
        if (targetX === undefined || targetY === undefined) return Infinity;
        const dx = this.position.x - targetX;
        const dy = this.position.y - targetY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Render the entity (to be implemented by subclasses)
    render(ctx, camera) {
        // Base implementation - draw a circle
        if (!this.visible) return;
        
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const screenRadius = this.radius * camera.scale;
        
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Optional: draw outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2 * camera.scale;
        ctx.stroke();
    }
    
    // Debug rendering (to be implemented by subclasses)
    renderDebug(ctx, camera) {
        if (!this.visible) return;
        
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        
        // Draw velocity vector
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2 * camera.scale;
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        ctx.lineTo(
            screenPos.x + (this.velocity.x * 0.1 * camera.scale),
            screenPos.y + (this.velocity.y * 0.1 * camera.scale)
        );
        ctx.stroke();
        
        // Draw acceleration vector
        ctx.strokeStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        ctx.lineTo(
            screenPos.x + (this.acceleration.x * 0.1 * camera.scale),
            screenPos.y + (this.acceleration.y * 0.1 * camera.scale)
        );
        ctx.stroke();
    }
    
    // Reset entity to initial state (for level restart)
    reset() {
        // To be overridden by subclasses
    }
    
    // Destroy/remove entity
    destroy() {
        this.active = false;
        this.visible = false;
    }
}

