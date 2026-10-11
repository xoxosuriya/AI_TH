// High-performance particle engine for dynamic canvas visual effects
export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 300;
    }
    
    // Clear all active particles
    clear() {
        this.particles = [];
    }
    
    // Spawn treasure collection explosion
    emitTreasureBurst(x, y, color = '#F59E0B', count = 18) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 140;
            const life = 0.5 + Math.random() * 0.5;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 20,
                radius: 2 + Math.random() * 3,
                color: color,
                alpha: 1,
                life: life,
                maxLife: life,
                gravity: 80,
                shape: Math.random() > 0.4 ? 'spark' : 'circle'
            });
        }
    }
    
    // Spawn subtle movement dust / energy spark
    emitMovementTrail(x, y, color = 'rgba(56, 189, 248, 0.4)', count = 2) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            const angle = Math.random() * Math.PI * 2;
            const speed = 10 + Math.random() * 25;
            const life = 0.25 + Math.random() * 0.25;
            
            this.particles.push({
                x: x + (Math.random() - 0.5) * 8,
                y: y + (Math.random() - 0.5) * 8,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1.5 + Math.random() * 2,
                color: color,
                alpha: 0.6,
                life: life,
                maxLife: life,
                gravity: -10, // Slight float up
                shape: 'circle'
            });
        }
    }
    
    // Portal swirling ambient motes
    emitPortalMote(portalX, portalY, color = '#10B981') {
        if (this.particles.length >= this.maxParticles) return;
        const radius = 28 + Math.random() * 12;
        const angle = Math.random() * Math.PI * 2;
        const x = portalX + Math.cos(angle) * radius;
        const y = portalY + Math.sin(angle) * radius;
        const life = 0.8 + Math.random() * 0.4;
        
        this.particles.push({
            x: x,
            y: y,
            vx: -Math.cos(angle) * 35 - Math.sin(angle) * 20,
            vy: -Math.sin(angle) * 35 + Math.cos(angle) * 20,
            radius: 1.5 + Math.random() * 2,
            color: color,
            alpha: 0.8,
            life: life,
            maxLife: life,
            gravity: 0,
            shape: 'spark'
        });
    }
    
    // Update all particles
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= deltaTime;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // Physics
            p.vy += p.gravity * deltaTime;
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            
            // Air resistance
            p.vx *= 0.98;
            p.vy *= 0.98;
            
            // Fade out
            p.alpha = Math.max(0, p.life / p.maxLife);
        }
    }
    
    // Render particles transformed through camera
    render(ctx, camera) {
        if (this.particles.length === 0) return;
        
        ctx.save();
        for (const p of this.particles) {
            const screen = camera.worldToScreen(p.x, p.y);
            const r = Math.max(1, p.radius * camera.scale);
            
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            
            if (p.shape === 'spark') {
                // Draw 4-point star glint
                ctx.beginPath();
                ctx.moveTo(screen.x, screen.y - r * 1.6);
                ctx.lineTo(screen.x + r * 0.4, screen.y - r * 0.4);
                ctx.lineTo(screen.x + r * 1.6, screen.y);
                ctx.lineTo(screen.x + r * 0.4, screen.y + r * 0.4);
                ctx.lineTo(screen.x, screen.y + r * 1.6);
                ctx.lineTo(screen.x - r * 0.4, screen.y + r * 0.4);
                ctx.lineTo(screen.x - r * 1.6, screen.y);
                ctx.lineTo(screen.x - r * 0.4, screen.y - r * 0.4);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }
}

export const particles = new ParticleSystem();
