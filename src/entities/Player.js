// Player entity - human-controlled character
import { Entity } from './Entity.js';
import { CONFIG } from '../config.js';
import { InputManager } from '../utils/input.js';
import { particles } from '../rendering/ParticleSystem.js';

export class Player extends Entity {
    constructor(x, y, options = {}) {
        super(x, y, 'player', {
            radius: CONFIG.PLAYER.RADIUS,
            maxSpeed: CONFIG.PLAYER.SPEED,
            maxForce: CONFIG.PLAYER.ACCELERATION,
            color: CONFIG.PLAYER.COLOR,
            ...options
        });
        
        // Input state
        this.input = {
            up: false,
            down: false,
            left: false,
            right: false,
            // For diagonal movement normalization
            lastInputTime: 0
        };
        
        // Visual enhancements
        this.direction = { x: 0, y: -1 }; // Facing up initially
        this.nameLabel = 'YOU';
        this.score = 0;
    }
    
    // Collect treasure and add points
    collectTreasure(treasure) {
        if (!treasure) return 0;
        const pts = treasure.value || 10;
        this.score += pts;
        return pts;
    }
    
    // Handle keyboard input
    handleInput(input) {
        if (!input) return;
        this.input.up = input.isPressed('w') || input.isPressed('ArrowUp') || input.isPressed('arrowup');
        this.input.down = input.isPressed('s') || input.isPressed('ArrowDown') || input.isPressed('arrowdown');
        this.input.left = input.isPressed('a') || input.isPressed('ArrowLeft') || input.isPressed('arrowleft');
        this.input.right = input.isPressed('d') || input.isPressed('ArrowRight') || input.isPressed('arrowright');
        
        // Update facing direction based on movement
        const movingUp = this.input.up;
        const movingDown = this.input.down;
        const movingLeft = this.input.left;
        const movingRight = this.input.right;
        
        if (movingUp && !movingDown) {
            this.direction.y = -1;
            this.direction.x = 0;
        } else if (movingDown && !movingUp) {
            this.direction.y = 1;
            this.direction.x = 0;
        }
        
        if (movingLeft && !movingRight) {
            this.direction.x = -1;
            this.direction.y = 0;
        } else if (movingRight && !movingLeft) {
            this.direction.x = 1;
            this.direction.y = 0;
        }
        
        // Diagonal direction normalization
        if ((movingUp || movingDown) && (movingLeft || movingRight)) {
            // Normalize diagonal direction to prevent faster diagonal movement
            const length = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
            if (length > 0) {
                this.direction.x /= length;
                this.direction.y /= length;
            }
        }
    }
    
    // Update player state
    update(deltaTime, input, obstacleEntities) {
        // Store previous position
        this.previousPosition = { x: this.position.x, y: this.position.y };
        
        // Handle input
        if (input) {
            this.handleInput(input);
        }
        
        // Calculate desired movement direction
        let moveX = 0;
        let moveY = 0;
        
        if (this.input.up) moveY -= 1;
        if (this.input.down) moveY += 1;
        if (this.input.left) moveX -= 1;
        if (this.input.right) moveX += 1;
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX /= length;
            moveY /= length;
        }
        
        // Apply movement force
        const force = {
            x: moveX * this.maxForce,
            y: moveY * this.maxForce
        };
        this.applyForce(force);
        
        // Call parent update (applies velocity and acceleration)
        super.update(deltaTime);
        
        // Velocity damping and speed limit
        const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (currentSpeed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / currentSpeed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / currentSpeed) * this.maxSpeed;
        }
        if (moveX === 0 && moveY === 0) {
            this.velocity.x *= 0.85;
            this.velocity.y *= 0.85;
            if (Math.abs(this.velocity.x) < 0.1) this.velocity.x = 0;
            if (Math.abs(this.velocity.y) < 0.1) this.velocity.y = 0;
        }
        
        // Obstacle collision resolution
        if (obstacleEntities && obstacleEntities.length > 0) {
            for (const obstacle of obstacleEntities) {
                const dx = this.position.x - obstacle.x;
                const dy = this.position.y - obstacle.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = this.radius + (obstacle.radius || 30);
                if (dist < minDist && dist > 0) {
                    const overlap = minDist - dist;
                    this.position.x += (dx / dist) * overlap;
                    this.position.y += (dy / dist) * overlap;
                }
            }
        }
        
        // Emit thruster dust/energy trail when in motion
        if ((moveX !== 0 || moveY !== 0) && Math.random() < 0.4) {
            particles.emitMovementTrail(this.position.x, this.position.y, 'rgba(56, 189, 248, 0.5)', 1);
        }
    }
    
    // Render the player with energy shield and directional chevron
    render(ctx, camera) {
        if (!this.visible) return;
        
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const screenRadius = this.radius * camera.scale;
        
        // Ambient soft ground shadow
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y + screenRadius * 0.4);
        ctx.scale(1, 0.4);
        ctx.beginPath();
        ctx.arc(0, 0, screenRadius * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();
        ctx.restore();
        
        // Outer cyan energy halo
        const haloGrad = ctx.createRadialGradient(screenPos.x, screenPos.y, screenRadius * 0.6, screenPos.x, screenPos.y, screenRadius * 1.6);
        haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
        haloGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, screenRadius * 1.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Metallic armored sphere
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
        const bodyGrad = ctx.createRadialGradient(screenPos.x - screenRadius * 0.3, screenPos.y - screenRadius * 0.3, 1, screenPos.x, screenPos.y, screenRadius);
        bodyGrad.addColorStop(0, '#BAE6FD');
        bodyGrad.addColorStop(0.3, '#38BDF8');
        bodyGrad.addColorStop(0.8, '#0284C7');
        bodyGrad.addColorStop(1, '#0369A1');
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        
        // Crisp inner ring
        ctx.strokeStyle = '#E0F2FE';
        ctx.lineWidth = 1.5 * camera.scale;
        ctx.stroke();
        
        // Direction pointer (glowing forward arrow)
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        const angle = Math.atan2(this.direction.y, this.direction.x);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(screenRadius * 0.9, 0);
        ctx.lineTo(screenRadius * 0.1, -screenRadius * 0.45);
        ctx.lineTo(screenRadius * 0.3, 0);
        ctx.lineTo(screenRadius * 0.1, screenRadius * 0.45);
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.restore();
        
        // Name badge pill
        ctx.save();
        const labelY = screenPos.y - screenRadius - 8 * camera.scale;
        ctx.font = `bold ${Math.max(10, Math.round(11 * camera.scale))}px Outfit, Arial`;
        const textWidth = ctx.measureText(this.nameLabel).width;
        
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(screenPos.x - textWidth / 2 - 5 * camera.scale, labelY - 10 * camera.scale, textWidth + 10 * camera.scale, 14 * camera.scale, 4 * camera.scale);
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1 * camera.scale;
        ctx.stroke();
        
        ctx.fillStyle = '#38BDF8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.nameLabel, screenPos.x, labelY - 3 * camera.scale);
        ctx.restore();
    }
    
    // Render debug info
    renderDebug(ctx, camera) {
        super.renderDebug(ctx, camera);
        
        if (!this.visible) return;
        
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        
        // Draw input directions
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2 * camera.scale;
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        // Draw input vector
        let inputX = 0;
        let inputY = 0;
        if (this.input.up) inputY -= 1;
        if (this.input.down) inputY += 1;
        if (this.input.left) inputX -= 1;
        if (this.input.right) inputX += 1;
        if (inputX !== 0 || inputY !== 0) {
            const length = Math.sqrt(inputX * inputX + inputY * inputY);
            if (length > 0) {
                inputX /= length;
                inputY /= length;
            }
            ctx.lineTo(
                screenPos.x + (inputX * this.radius * 1.5 * camera.scale),
                screenPos.y + (inputY * this.radius * 1.5 * camera.scale)
            );
        }
        ctx.stroke();
    }
    
    // Reset player for level restart
    reset(startX, startY) {
        this.position.x = startX;
        this.position.y = startY;
        this.previousPosition.x = startX;
        this.previousPosition.y = startY;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        this.direction = { x: 0, y: -1 }; // Reset to facing up
        this.active = true;
        this.visible = true;
    }
}

