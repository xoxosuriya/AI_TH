// Exit entity - goal area that activates when objective is met
import { Entity } from './Entity.js';
import { CONFIG } from '../config.js';

export class Exit extends Entity {
    constructor(x, y, options = {}) {
        super(x, y, 'exit', {
            radius: 20, // Slightly larger than player for easier targeting
            maxSpeed: 0,
            maxForce: 0,
            color: '#228B22', // Forest green - will change when active
            ...options
        });
        
        // Exit properties
        this.active = false; // Whether exit is active (can be used to complete level)
        this.requiredScore = options.requiredScore || 0; // Score needed to activate exit
        this.glowIntensity = 0; // 0 to 1, pulses when active
        this.glowPulseSpeed = 2; // Pulses per second when active
        this.glowOffset = 0;
        
        // Particle effect for activation
        this.activationParticles = [];
        this.activationTimer = 0;
    }
    
    // Update exit state
    update(deltaTime, currentScore) {
        super.update(deltaTime);
        
        // Check if exit should be active based on score
        const shouldBeActive = currentScore >= this.requiredScore;
        
        if (shouldBeActive && !this.active) {
            // Just became active - trigger activation effect
            this.activate();
        } else if (!shouldBeActive && this.active) {
            // No longer active (shouldn't happen in normal gameplay, but handle anyway)
            this.deactivate();
        }
        
        // Update glow pulse if active
        if (this.active) {
            this.glowOffset += this.glowPulseSpeed * deltaTime * Math.PI * 2;
            if (this.glowOffset > Math.PI * 2) {
                this.glowOffset -= Math.PI * 2;
            }
            this.glowIntensity = Math.abs(Math.sin(this.glowOffset)) * 0.7 + 0.3; // 0.3 to 1.0
        }
        
        // Update activation particles
        this._updateParticles(deltaTime);
    }
    
    // Activate the exit (when score requirement is met)
    activate() {
        this.active = true;
        this.color = '#00FF00'; // Bright green when active
        
        // Create activation particle burst
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i * Math.PI * 2) / particleCount;
            const speed = 50 + Math.random() * 100; // 50-150 px/s
            this.activationParticles.push({
                x: this.position.x,
                y: this.position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.5, // 0.5-1.0 seconds
                maxLife: 0.5 + Math.random() * 0.5,
                size: 2 + Math.random() * 3, // 2-5 pixels
                color: ['#00FF00', '#00CC00', '#009900'][Math.floor(Math.random() * 3)]
            });
        }
        
        this.activationTimer = 0;
    }
    
    // Deactivate the exit
    deactivate() {
        this.active = false;
        this.color = '#228B22'; // Return to forest green
        this.glowIntensity = 0;
    }
    
    // Update activation particles
    _updateParticles(deltaTime) {
        // Update existing particles
        for (let i = this.activationParticles.length - 1; i >= 0; i--) {
            const p = this.activationParticles[i];
            
            // Update position
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 200 * deltaTime; // Gravity
            
            // Update life
            p.life -= deltaTime;
            
            // Remove dead particles
            if (p.life <= 0) {
                this.activationParticles.splice(i, 1);
            }
        }
        
        // Add occasional particles while active (for ongoing effect)
        if (this.active && Math.random() < 0.3) { // 30% chance per frame
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 40; // 20-60 px/s
            this.activationParticles.push({
                x: this.position.x,
                y: this.position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.3 + Math.random() * 0.4, // 0.3-0.7 seconds
                maxLife: 0.3 + Math.random() * 0.4,
                size: 1 + Math.random() * 2, // 1-3 pixels
                color: '#00FF00'
            });
        }
    }
    
    // Render the exit with glow effect
    render(ctx, camera) {
        if (!this.visible) return;
        
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const baseRadius = this.radius * camera.scale;
        
        // Draw activation particles first (behind exit)
        for (const p of this.activationParticles) {
            const particleScreen = camera.worldToScreen(p.x, p.y);
            const alpha = p.life / p.maxLife;
            
            ctx.save();
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(particleScreen.x, particleScreen.y, p.size * camera.scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Draw outer glow (when active)
        if (this.active) {
            const glowRadius = baseRadius * (1 + this.glowIntensity * 0.5); // Up to 50% larger glow
            const glowAlpha = this.glowIntensity * 0.6;
            
            ctx.save();
            ctx.globalAlpha = glowAlpha;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.active ? '#00FF00' : '#228B22';
            ctx.fill();
            ctx.restore();
        }
        
        // Draw main exit body (pulsing circle/square)
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        
        // Pulse the size slightly when active
        const pulseSize = this.active ? 
            (1 + Math.sin(performance.now() * 0.003) * 0.1) : // Subtle pulse
            1;
        
        ctx.scale(pulseSize, pulseSize);
        
        // Draw as a square rotated 45 degrees (diamond) for exit symbol
        ctx.rotate(Math.PI / 4); // 45 degrees
        ctx.beginPath();
        ctx.rect(-baseRadius * 0.7, -baseRadius * 0.7, baseRadius * 1.4, baseRadius * 1.4);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
        
        // Draw inner symbol (like a door or arrow)
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y - baseRadius * 0.4); // Top point
        ctx.lineTo(screenPos.x + baseRadius * 0.4, screenPos.y); // Right point
        ctx.lineTo(screenPos.x, screenPos.y + baseRadius * 0.4); // Bottom point
        ctx.lineTo(screenPos.x - baseRadius * 0.4, screenPos.y); // Left point
        ctx.closePath();
        ctx.fillStyle = '#000000'; // Dark inner color for contrast
        ctx.fill();
        
        // Optional: draw outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2 * camera.scale;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, baseRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Render debug info
    renderDebug(ctx, camera) {
        if (!this.visible) return;
        
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        
        // Draw required score text
        ctx.fillStyle = '#FFFF00';
        ctx.font = `${Math.round(12 * camera.scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`Req: ${this.requiredScore}`, screenPos.x, screenPos.y + this.radius * camera.scale + 2 * camera.scale);
        
        // Draw active status
        ctx.fillStyle = this.active ? '#00FF00' : '#FF0000';
        ctx.font = `${Math.round(10 * camera.scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(this.active ? 'ACTIVE' : 'LOCKED', screenPos.x, screenPos.y + this.radius * camera.scale + 16 * camera.scale);
    }
    
    // Check if player has reached exit (for level completion)
    isReachedBy(entity) {
        if (!this.active) {
            return false; // Exit must be active to be reached
        }
        
        return this.overlaps(entity);
    }
    
    // Reset exit for level restart
    reset(x, y, requiredScore) {
        this.position.x = x;
        this.position.y = y;
        this.requiredScore = requiredScore;
        this.radius = 20;
        
        // Reset state
        this.active = false;
        this.color = '#228B22';
        this.glowIntensity = 0;
        this.glowOffset = 0;
        
        // Reset particles
        this.activationParticles = [];
        this.activationTimer = 0;
        
        this.active = true;
        this.visible = true;
    }
}

