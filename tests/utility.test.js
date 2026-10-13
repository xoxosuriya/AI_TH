// Tests for Utility Target Selector and Decision Theory
import { UtilityTargetSelector } from '../src/ai/UtilityTargetSelector.js';

export function runUtilityTests() {
    const results = [];

    // Test 1: Utility selector initialization and weights
    try {
        const selector = new UtilityTargetSelector();
        const weights = selector.weights;
        const sum = Object.values(weights).reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1.0) < 0.01 && weights.value > 0 && weights.distance > 0) {
            results.push({ name: 'UtilityTargetSelector weights normalize to 1.0', pass: true });
        } else {
            results.push({ name: 'UtilityTargetSelector weights normalize to 1.0', pass: false, error: `Sum = ${sum}` });
        }
    } catch (e) {
        results.push({ name: 'UtilityTargetSelector weights normalize to 1.0', pass: false, error: e.message });
    }

    // Test 2: Selects higher-value treasure when distances are equal
    try {
        const selector = new UtilityTargetSelector({
            value: 0.50,
            distance: 0.20,
            risk: 0.10,
            competition: 0.10,
            urgency: 0.10
        });

        const agent = { position: { x: 100, y: 100 }, currentTarget: null };
        const treasures = [
            { id: 'coin', value: 10, position: { x: 200, y: 100 } },
            { id: 'artifact', value: 100, position: { x: 200, y: 100 } }
        ];

        const decision = selector.selectTarget(agent, treasures, [], null, { timeRemaining: 60 });
        if (decision && decision.target && decision.target.id === 'artifact') {
            results.push({ name: 'Utility favors high-value artifact at equal distance', pass: true });
        } else {
            results.push({ name: 'Utility favors high-value artifact at equal distance', pass: false, error: `Selected: ${decision?.target?.id}` });
        }
    } catch (e) {
        results.push({ name: 'Utility favors high-value artifact at equal distance', pass: false, error: e.message });
    }

    // Test 3: Selects closer treasure when values are equal
    try {
        const selector = new UtilityTargetSelector();
        const agent = { position: { x: 100, y: 100 }, currentTarget: null };
        const treasures = [
            { id: 'far_gold', value: 50, position: { x: 800, y: 600 } },
            { id: 'near_gold', value: 50, position: { x: 120, y: 100 } }
        ];

        const decision = selector.selectTarget(agent, treasures, [], null, { timeRemaining: 60 });
        if (decision && decision.target && decision.target.id === 'near_gold') {
            results.push({ name: 'Utility favors closer target when values match', pass: true });
        } else {
            results.push({ name: 'Utility favors closer target when values match', pass: false, error: `Selected: ${decision?.target?.id}` });
        }
    } catch (e) {
        results.push({ name: 'Utility favors closer target when values match', pass: false, error: e.message });
    }

    // Test 4: Empty treasures returns null gracefully
    try {
        const selector = new UtilityTargetSelector();
        const agent = { position: { x: 100, y: 100 }, currentTarget: null };
        const decision = selector.selectTarget(agent, [], [], null, {});
        if (decision === null) {
            results.push({ name: 'Utility returns null gracefully for empty candidates', pass: true });
        } else {
            results.push({ name: 'Utility returns null gracefully for empty candidates', pass: false, error: 'Expected null' });
        }
    } catch (e) {
        results.push({ name: 'Utility returns null gracefully for empty candidates', pass: false, error: e.message });
    }

    return results;
}
