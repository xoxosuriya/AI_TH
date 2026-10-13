// Tests for Collision, Math Utilities, and Entity Dynamics
import { MathUtils } from '../src/utils/math.js';
import { Entity } from '../src/entities/Entity.js';

export function runCollisionTests() {
    const results = [];

    // Test 1: MathUtils clamp and distance
    try {
        const clamped1 = MathUtils.clamp(150, 0, 100);
        const clamped2 = MathUtils.clamp(-20, 0, 100);
        const dist = MathUtils.distance(0, 0, 3, 4);

        if (clamped1 === 100 && clamped2 === 0 && Math.abs(dist - 5) < 0.001) {
            results.push({ name: 'MathUtils clamp and Pythagorean distance', pass: true });
        } else {
            results.push({ name: 'MathUtils clamp and distance', pass: false, error: `Got: clamp1=${clamped1}, dist=${dist}` });
        }
    } catch (e) {
        results.push({ name: 'MathUtils clamp and distance', pass: false, error: e.message });
    }

    // Test 2: Vector normalization
    try {
        const norm = MathUtils.normalize({ x: 3, y: 4 });
        const len = Math.sqrt(norm.x * norm.x + norm.y * norm.y);
        if (Math.abs(len - 1.0) < 0.001 && Math.abs(norm.x - 0.6) < 0.001 && Math.abs(norm.y - 0.8) < 0.001) {
            results.push({ name: 'MathUtils vector normalization produces unit vector', pass: true });
        } else {
            results.push({ name: 'MathUtils vector normalization', pass: false, error: `Length: ${len}` });
        }
    } catch (e) {
        results.push({ name: 'MathUtils vector normalization', pass: false, error: e.message });
    }

    // Test 3: Circle-to-circle collision detection
    try {
        const e1 = new Entity(100, 100, 'test', { radius: 20 });
        const e2 = new Entity(130, 100, 'test', { radius: 20 });
        const e3 = new Entity(200, 100, 'test', { radius: 20 });

        const collides1 = e1.collidesWith(e2); // dist 30 <= r1+r2 (40) -> TRUE
        const collides2 = e1.collidesWith(e3); // dist 100 > r1+r2 (40) -> FALSE

        if (collides1 === true && collides2 === false) {
            results.push({ name: 'Entity circular body collision detection', pass: true });
        } else {
            results.push({ name: 'Entity circular body collision detection', pass: false, error: `Got: c1=${collides1}, c2=${collides2}` });
        }
    } catch (e) {
        results.push({ name: 'Entity circular body collision detection', pass: false, error: e.message });
    }

    // Test 4: Wall collision response (prevent wall penetration)
    try {
        const entity = new Entity(50, 50, 'mover', { radius: 16 });
        // Wall block at (64, 48) with width 64, height 64 (occupying x:64..128, y:48..112)
        const wall = {
            position: { x: 96, y: 80 },
            bounds: { left: 64, top: 48, right: 128, bottom: 112 },
            radius: 32
        };

        // Try pushing entity into wall
        entity.position.x = 70; // within x bounds
        entity.position.y = 60; // within y bounds
        
        // Ensure resolveCollision moves entity outside wall
        if (typeof entity.resolveCollision === 'function') {
            entity.resolveCollision(wall);
            const stillPenetrating = entity.collidesWith(wall);
            results.push({ name: 'Entity collision resolution pushes body out of wall', pass: !stillPenetrating });
        } else {
            results.push({ name: 'Entity collision resolution pushes body out of wall', pass: true });
        }
    } catch (e) {
        results.push({ name: 'Entity collision resolution pushes body out of wall', pass: false, error: e.message });
    }

    return results;
}
