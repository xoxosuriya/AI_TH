// Visual effects system - particle effects, floating text, etc.
export class Effects {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
        this.screenFlash = {
            active: false,
            color: '#FFFF00',
            alpha: 0,
            duration: 0
        };
        
        // Object pools for performance (would be implemented in full version)
        this.particlePool = [];
        this.floatingTextPool = [];
    }
    
    // Create treasure collection effect
    treasureCollected(position) {
        // Create particle burst
        const particleCount = 8 + Math.floor(Math.random() * 4); // 8-12 particles
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5; // Some randomness
            const speed = 50 + Math.random() * 100; // 50-150 px/s
            
            this.particles.push({
                x: position.x,
                y: position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.5, // 0.5-1.0 seconds
                maxLife: 0.5 + Math.random() * 0.5,
                size: 2 + Math.random() * 3, // 2-5 pixels
                color: this._getRandomTreasureColor()
            });
        }
        
        // Create floating text would be handled by Treasure entity itself
    }
    
    // Create screen flash effect
    flashScreen(color, duration) {
        this.screenFlash.active = true;
        this.screenFlash.color = color || '#FFFF00';
        this.screenFlash.alpha = 0.8; // Start at 80% opacity
        this.screenFlash.duration = duration || 300; // 300ms default
    }
    
    // Create camera shake effect (would be called by game)
    shakeCamera(intensity, duration) {
        // This would be handled by the camera system
        // For now, we'll just note it
    }
    
    // Update all effects
    update(deltaTime) {
        // Update particles
        this._updateParticles(deltaTime);
        
        // Update floating texts
        this._updateFloatingTexts(deltaTime);
        
        // Update screen flash
        if (this.screenFlash.active) {
            this.screenFlash.duration -= deltaTime * 1000; // Convert to milliseconds
            if (this.screenFlash.duration <= 0) {
                this.screenFlash.active = false;
                this.screenFlash.alpha = 0;
            } else {
                // Fade out
                this.screenFlash.alpha = (this.screenFlash.duration / 300) * 0.8; // Assuming 300ms duration
            }
        }
    }
    
    // Update particles
    _updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 200 * deltaTime; // Gravity
            
            // Update life
            p.life -= deltaTime;
            
            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // Update floating texts
    _updateFloatingTexts(deltaTime) {
        // Floating text would be handled by individual treasure entities
        // This is just a placeholder
    }
    
    // Render all effects
    render(ctx, camera) {
        // Render particles
        this._renderParticles(ctx, camera);
        
        // Render screen flash
        this._renderScreenFlash(ctx, camera);
        
        // Floating text would be rendered by treasure entities
    }
    
    // Render particles
    _renderParticles(ctx, camera) {
        for (const p of this.particles) {
            const screenPos = camera.worldToScreen(p.x, p.y);
            const alpha = p.life / p.maxLife;
            
            ctx.save();
            ctx.globalAlpha = alpha * 0.8; // Slightly transparent
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, p.size * camera.scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Render screen flash
    _renderScreenFlash(ctx, camera) {
        if (!this.screenFlash.active) return;
        
        ctx.save();
        ctx.globalAlpha = this.screenFlash.alpha;
        ctx.fillStyle = this.screenFlash.color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }
    
    // Get random treasure color based on type
    _getRandomTreasureColor() {
        const colors = [
            '#FFD700', // Gold
            '#FFA500', // Orange
            '#00FFFF', // Cyan
            '#8A2BE2'  // Blue violet
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Clear all effects
    clear() {
        this.particles = [];
        this.floatingTexts = [];
        this.screenFlash.active = false;
    }
}

