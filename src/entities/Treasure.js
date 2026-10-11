// Treasure entity - collectible items with different values
import { Entity } from './Entity.js';
import { CONFIG } from '../config.js';
import { sound } from '../utils/AudioSystem.js';
import { particles } from '../rendering/ParticleSystem.js';

export class Treasure extends Entity {
    constructor(x, y, type, options = {}) {
        // Get treasure configuration
        let treasureConfig = CONFIG.TREASURE_TYPES[type];
        if (!treasureConfig) {
            console.warn(`Unknown treasure type: ${type}, defaulting to coin`);
            treasureConfig = CONFIG.TREASURE_TYPES.coin;
        }
        
        super(x, y, 'treasure', {
            radius: 13,
            maxSpeed: 0,
            maxForce: 0,
            color: treasureConfig.color,
            value: treasureConfig.value,
            treasureType: type,
            ...options
        });
        
        // Animation properties for pulse/glow effect
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.pulseSpeed = 1.8 + Math.random() * 0.8;
        this.baseRadius = this.radius;
        this.glowIntensity = 0.7;
        this.rotationAngle = Math.random() * Math.PI;
        
        // Floating score text when collected
        this.floatText = null;
        this.floatTextTimer = 0;
        this.floatTextDuration = 900;
        this.floatTextInitialVelocity = { x: (Math.random() - 0.5) * 15, y: -45 };
    }
    
    // Update treasure state (animations)
    update(deltaTime) {
        super.update(deltaTime);
        
        this.pulseOffset += this.pulseSpeed * deltaTime * Math.PI * 2;
        this.rotationAngle += 1.5 * deltaTime;
        
        const pulse = Math.sin(this.pulseOffset) * 0.2 + 1;
        this.radius = this.baseRadius * pulse;
        
        if (this.floatText) {
            this.floatTextTimer += deltaTime * 1000;
            if (this.floatTextTimer >= this.floatTextDuration) {
                this.floatText = null;
            }
        }
    }
    
    // Render the treasure with glow and jewel facets
    render(ctx, camera) {
        // Always render floating text even after collection
        if (this.floatText) {
            this.renderFloatText(ctx, camera);
        }
        
        if (!this.visible || this.collected) return;
        
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const screenRadius = this.radius * camera.scale;
        
        // Ambient radial glow
        const glowGrad = ctx.createRadialGradient(screenPos.x, screenPos.y, 2, screenPos.x, screenPos.y, screenRadius * 2.2);
        glowGrad.addColorStop(0, this.color);
        glowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.save();
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, screenRadius * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        
        switch (this.treasureType) {
            case 'coin':
                // 3D Gold Coin with spin effect
                const coinScaleX = Math.abs(Math.cos(this.rotationAngle));
                ctx.scale(Math.max(0.2, coinScaleX), 1);
                
                ctx.beginPath();
                ctx.arc(0, 0, screenRadius, 0, Math.PI * 2);
                const coinGrad = ctx.createLinearGradient(-screenRadius, -screenRadius, screenRadius, screenRadius);
                coinGrad.addColorStop(0, '#FDE047');
                coinGrad.addColorStop(0.5, '#EAB308');
                coinGrad.addColorStop(1, '#A16207');
                ctx.fillStyle = coinGrad;
                ctx.fill();
                
                // Embossed inner ring
                ctx.strokeStyle = '#FEF08A';
                ctx.lineWidth = 1.5 * camera.scale;
                ctx.beginPath();
                ctx.arc(0, 0, screenRadius * 0.65, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'gem':
                // Faceted Octagonal Cyan/Pink Gem
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const ang = (i * Math.PI * 2 / 8) - Math.PI / 8;
                    const gx = screenRadius * Math.cos(ang);
                    const gy = screenRadius * Math.sin(ang);
                    if (i === 0) ctx.moveTo(gx, gy);
                    else ctx.lineTo(gx, gy);
                }
                ctx.closePath();
                const gemGrad = ctx.createRadialGradient(-screenRadius * 0.3, -screenRadius * 0.3, 1, 0, 0, screenRadius);
                gemGrad.addColorStop(0, '#FFFFFF');
                gemGrad.addColorStop(0.3, this.color);
                gemGrad.addColorStop(1, '#0F172A');
                ctx.fillStyle = gemGrad;
                ctx.fill();
                
                // Inner facet lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 1 * camera.scale;
                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                    const ang = (i * Math.PI * 2 / 8) - Math.PI / 8;
                    ctx.moveTo(0, 0);
                    ctx.lineTo(screenRadius * Math.cos(ang), screenRadius * Math.sin(ang));
                }
                ctx.stroke();
                break;
                
            case 'artifact':
                // Ancient Celestial Relic with orbiting rings
                ctx.beginPath();
                ctx.arc(0, 0, screenRadius * 0.65, 0, Math.PI * 2);
                const artGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, screenRadius * 0.65);
                artGrad.addColorStop(0, '#F43F5E');
                artGrad.addColorStop(0.7, '#881337');
                artGrad.addColorStop(1, '#4C0519');
                ctx.fillStyle = artGrad;
                ctx.fill();
                
                // Orbiting celestial ring 1
                ctx.strokeStyle = '#38BDF8';
                ctx.lineWidth = 1.5 * camera.scale;
                ctx.beginPath();
                ctx.ellipse(0, 0, screenRadius * 1.2, screenRadius * 0.45, this.rotationAngle, 0, Math.PI * 2);
                ctx.stroke();
                
                // Orbiting celestial ring 2
                ctx.strokeStyle = '#F59E0B';
                ctx.beginPath();
                ctx.ellipse(0, 0, screenRadius * 1.2, screenRadius * 0.45, -this.rotationAngle, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            default: // gold / bar
                ctx.beginPath();
                ctx.moveTo(0, -screenRadius);
                ctx.lineTo(screenRadius, 0);
                ctx.lineTo(0, screenRadius);
                ctx.lineTo(-screenRadius, 0);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.5 * camera.scale;
                ctx.stroke();
                break;
        }
        ctx.restore();
    }
        
    // Render debug info
    renderDebug(ctx, camera) {
        if (!this.visible) return;
        
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        
        // Draw value text
        ctx.fillStyle = '#FFFF00';
        ctx.font = `${Math.round(12 * camera.scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`+${this.value}`, screenPos.x, screenPos.y - this.radius * camera.scale - 5 * camera.scale);
    }
    
    // Called when treasure is collected - sets up floating text, sound, and particles
    onCollected() {
        if (this.collected) return;
        this.collected = true;
        this.visible = false;
        
        // Sound synthesis
        if (this.treasureType === 'coin') {
            sound.playCoin();
        } else if (this.treasureType === 'artifact') {
            sound.playArtifact();
        } else {
            sound.playGem();
        }
        
        // Visual particle burst
        particles.emitTreasureBurst(this.position.x, this.position.y, this.color, 20);
        
        // Initialize floating text
        this.floatText = `+${this.value}`;
        this.floatTextTimer = 0;
        this.floatTextPosition = {
            x: this.position.x,
            y: this.position.y
        };
        this.floatTextVelocity = {
            x: this.floatTextInitialVelocity.x,
            y: this.floatTextInitialVelocity.y
        };
    }
    
    // Render floating text (called by renderer/system)
    renderFloatText(ctx, camera) {
        if (!this.floatText) return;
        
        // Update position based on velocity and time
        const progress = this.floatTextTimer / this.floatTextDuration; // 0 to 1
        this.floatTextPosition.x += this.floatTextVelocity.x * (1/60); // Assuming 60 FPS for simplicity
        this.floatTextPosition.y += this.floatTextVelocity.y * (1/60);
        this.floatTextVelocity.y += 20 * (1/60); // Gravity
        
        // Apply float-up motion
        this.floatTextPosition.y -= progress * 50; // Float up as timer progresses
        
        // Fade out
        const alpha = 1.0 - progress;
        
        const screenPos = camera.worldToScreen(this.floatTextPosition.x, this.floatTextPosition.y);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#FFFF00';
        ctx.font = `bold ${Math.round(14 * camera.scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.floatText, screenPos.x, screenPos.y);
        ctx.restore();
    }
    
    // Reset treasure for level restart
    reset(x, y, type) {
        this.position.x = x;
        this.position.y = y;
        
        // Get treasure configuration
        const treasureConfig = CONFIG.TREASURE_TYPES[type];
        if (!treasureConfig) {
            console.warn(`Unknown treasure type: ${type}, defaulting to coin`);
            treasureConfig = CONFIG.TREASURE_TYPES.coin;
        }
        
        this.treasureType = type;
        this.value = treasureConfig.value;
        this.color = treasureConfig.color;
        this.radius = 12;
        this.baseRadius = this.radius;
        
        // Reset animation properties
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.pulseSpeed = 1.5 + Math.random() * 1.0;
        this.glowIntensity = 0.5 + Math.random() * 0.5;
        
        // Reset collection state
        this.collected = false;
        this.visible = true;
        this.floatText = null;
        this.floatTextTimer = 0;
        
        this.active = true;
    }
}

