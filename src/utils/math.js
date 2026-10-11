// Math utility functions for game calculations
export class MathUtils {
    // Clamp a value between min and max
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    // Linear interpolation
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Distance between two points
    static distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    // Distance between two objects with position property
    static distanceTo(obj1, obj2) {
        if (!obj1 || !obj2 || !obj1.position || !obj2.position) {
            return 0;
        }
        return this.distance(obj1.position.x, obj1.position.y, obj2.position.x, obj2.position.y);
    }
    
    // Normalize a vector (returns new vector)
    static normalize(vector) {
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (length === 0) {
            return { x: 0, y: 0 };
        }
        return {
            x: vector.x / length,
            y: vector.y / length
        };
    }
    
    // Set vector length (modifies vector)
    static setLength(vector, length) {
        const currentLength = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (currentLength > 0) {
            const scale = length / currentLength;
            vector.x *= scale;
            vector.y *= scale;
        }
        return vector;
    }
    
    // Vector addition
    static add(v1, v2) {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y
        };
    }
    
    // Vector subtraction
    static subtract(v1, v2) {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y
        };
    }
    
    // Vector scaling
    static scale(vector, scalar) {
        return {
            x: vector.x * scalar,
            y: vector.y * scalar
        };
    }
    
    // Dot product
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    
    // Cross product (2D - returns scalar)
    static cross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }
    
    // Angle between two vectors
    static angle(v1, v2) {
        const dot = this.dot(v1, v2);
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        
        if (mag1 === 0 || mag2 === 0) {
            return 0;
        }
        
        return Math.acos(this.clamp(dot / (mag1 * mag2), -1, 1));
    }
    
    // Convert degrees to radians
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    // Convert radians to degrees
    static toDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    
    // Random float between min and max
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Random integer between min and max (inclusive)
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Check if value is power of two
    static isPowerOfTwo(value) {
        return (value & (value - 1)) === 0 && value !== 0;
    }
    
    // Next power of two
    static nextPowerOfTwo(value) {
        if (value <= 0) return 1;
        if (this.isPowerOfTwo(value)) return value;
        
        let power = 1;
        while (power < value) {
            power <<= 1;
        }
        return power;
    }
    
    // Smoothstep function
    static smoothstep(edge0, edge1, x) {
        // Scale, bias and saturate x to 0..1 range
        x = this.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        // Evaluate polynomial
        return x * x * (3 - 2 * x);
    }
    
    // Sign function
    static sign(x) {
        return (x < 0) ? -1 : (x > 0) ? 1 : 0;
    }
    
    // Convert grid coordinates to world coordinates (tile center)
    static gridToWorld(gridX, gridY, tileSize) {
        return {
            x: gridX * tileSize + tileSize / 2,
            y: gridY * tileSize + tileSize / 2
        };
    }
    
    // Convert world coordinates to grid coordinates
    static worldToGrid(worldX, worldY, tileSize) {
        return {
            x: Math.floor(worldX / tileSize),
            y: Math.floor(worldY / tileSize)
        };
    }
}

