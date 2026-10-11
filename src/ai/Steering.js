// Steering behaviors: Seek, Arrive, Avoid
import { CONFIG } from '../config.js';

export class Steering {
    constructor() {
        // Weights for combining behaviors (can be tuned)
        this.seekWeight = 1.0;
        this.arriveWeight = 1.0;
        this.avoidWeight = 2.0; // Higher weight for avoidance as per spec
        
        // Avoidance parameters
        this.avoidanceRadius = 50; // pixels - how close to start avoiding
        this.panicDistance = 25;   // pixels - maximum avoidance force
    }
    
    // Seek behavior: move toward target position
    seek(agent, targetPosition) {
        const desiredVelocity = this._vectorTo(
            agent.position.x,
            agent.position.y,
            targetPosition.x,
            targetPosition.y
        );
        
        // Scale to maximum speed
        this._setLength(desiredVelocity, agent.maxSpeed);
        
        // Steering = desired velocity - current velocity
        const steering = this._subtract(desiredVelocity, agent.velocity);
        return this._truncate(steering, agent.maxForce);
    }
    
    // Arrive behavior: slow down as we approach target
    arrive(agent, targetPosition, slowingDistance = 100) {
        const toTarget = this._vectorTo(
            agent.position.x,
            agent.position.y,
            targetPosition.x,
            targetPosition.y
        );
        
        const distance = this._length(toTarget);
        
        if (distance < 0.1) {
            return this._zeroVector();
        }
        
        let desiredSpeed = agent.maxSpeed;
        if (distance < slowingDistance) {
            desiredSpeed = agent.maxSpeed * (distance / slowingDistance);
        }
        
        const desiredVelocity = this._clone(toTarget);
        this._setLength(desiredVelocity, desiredSpeed);
        
        // Steering = desired velocity - current velocity
        const steering = this._subtract(desiredVelocity, agent.velocity);
        return this._truncate(steering, agent.maxForce);
    }
    
    // Avoid behavior: steer away from obstacles/agents
    avoid(agent, obstacles, panicDistance = null) {
        const panic = panicDistance !== null ? panicDistance : this.panicDistance;
        const avoidanceRadius = this.avoidanceRadius;
        
        let steeringForce = this._zeroVector();
        let avoidCount = 0;
        
        for (const obstacle of obstacles) {
            const obstPos = obstacle.position || obstacle;
            if (!obstPos) continue;
            const distance = this._distance(agent.position, obstPos);
            
            if (distance > avoidanceRadius) {
                continue; // Too far away to worry about
            }
            
            // Calculate away vector
            const away = this._vectorTo(
                obstPos.x,
                obstPos.y,
                agent.position.x,
                agent.position.y
            );
            
            // Scale by inversely to distance (closer = stronger push away)
            let strength = (avoidanceRadius - distance) / avoidanceRadius;
            strength = strength * strength; // Square for sharper increase near obstacle
            
            this._setLength(away, agent.maxSpeed * strength);
            
            // Steering is away - velocity (we want to move away from obstacle)
            const avoidForce = this._subtract(away, agent.velocity);
            steeringForce = this._add(steeringForce, avoidForce);
            avoidCount++;
        }
        
        if (avoidCount > 0) {
            // Average the avoidance forces
            this._divide(steeringForce, avoidCount);
            
            // Apply panic factor if too close
            for (const obstacle of obstacles) {
                const distance = this._distance(agent.position, obstacle.position);
                if (distance < panic) {
                    // Extra strong avoidance when very close
                    const away = this._vectorTo(
                        obstacle.position.x,
                        obstacle.position.y,
                        agent.position.x,
                        agent.position.y
                    );
                    this._setLength(away, agent.maxSpeed * 2); // Double strength when panicking
                    const panicForce = this._subtract(away, agent.velocity);
                    steeringForce = this._add(steeringForce, panicForce);
                }
            }
        }
        
        return this._truncate(steeringForce, agent.maxForce);
    }
    
    // Combine steering behaviors with weights
    combine(agent, steeringBehaviors) {
        let combined = this._zeroVector();
        
        // Apply each behavior with its weight
        if (steeringBehaviors.seek) {
            const seekForce = this.seek(agent, steeringBehaviors.seek.target);
            this._scale(seekForce, steeringBehaviors.seek.weight || this.seekWeight);
            combined = this._add(combined, seekForce);
        }
        
        if (steeringBehaviors.arrive) {
            const arriveForce = this.arrive(agent, steeringBehaviors.arrive.target, steeringBehaviors.arrive.slowingDistance);
            this._scale(arriveForce, steeringBehaviors.arrive.weight || this.arriveWeight);
            combined = this._add(combined, arriveForce);
        }
        
        if (steeringBehaviors.avoid) {
            const avoidForce = this.avoid(agent, steeringBehaviors.avoid.obstacles, steeringBehaviors.avoid.panicDistance);
            this._scale(avoidForce, steeringBehaviors.avoid.weight || this.avoidWeight);
            combined = this._add(combined, avoidForce);
        }
        
        return this._truncate(combined, agent.maxForce);
    }
    
    // Vector utilities
    _vectorTo(x1, y1, x2, y2) {
        return { x: x2 - x1, y: y2 - y1 };
    }
    
    _distance(p1, p2) {
        if (!p1 || !p2) return Infinity;
        const x1 = p1.x !== undefined ? p1.x : (p1.position ? p1.position.x : 0);
        const y1 = p1.y !== undefined ? p1.y : (p1.position ? p1.position.y : 0);
        const x2 = p2.x !== undefined ? p2.x : (p2.position ? p2.position.x : 0);
        const y2 = p2.y !== undefined ? p2.y : (p2.position ? p2.position.y : 0);
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    _clone(vector) {
        return { x: vector.x, y: vector.y };
    }
    
    _length(vector) {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    }
    
    _setLength(vector, length) {
        const currentLength = this._length(vector);
        if (currentLength > 0) {
            const scale = length / currentLength;
            vector.x *= scale;
            vector.y *= scale;
        }
        return vector;
    }
    
    _zeroVector() {
        return { x: 0, y: 0 };
    }
    
    _add(v1, v2) {
        return { x: v1.x + v2.x, y: v1.y + v2.y };
    }
    
    _subtract(v1, v2) {
        return { x: v1.x - v2.x, y: v1.y - v2.y };
    }
    
    _scale(vector, scalar) {
        return { x: vector.x * scalar, y: vector.y * scalar };
    }
    
    _divide(vector, scalar) {
        if (scalar !== 0) {
            return { x: vector.x / scalar, y: vector.y / scalar };
        }
        return vector;
    }
    
    _truncate(vector, max) {
        const length = this._length(vector);
        if (length > max) {
            this._setLength(vector, max);
        }
        return vector;
    }
    
    // Configuration methods
    setWeights(seek, arrive, avoid) {
        if (seek !== undefined) this.seekWeight = seek;
        if (arrive !== undefined) this.arriveWeight = arrive;
        if (avoid !== undefined) this.avoidWeight = avoid;
    }
    
    setAvoidanceParams(radius, panic) {
        if (radius !== undefined) this.avoidanceRadius = radius;
        if (panic !== undefined) this.panicDistance = panic;
    }
}

