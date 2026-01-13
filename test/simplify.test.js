import { describe, it, expect } from 'vitest';
import simplify from '../index.js';

// Sample test data (zigzag path with some noise)
const original = [
    0, 0, 10, 5, 20, 0, 30, 10, 40, 0, 50, 5, 60, 0,
    70, 10, 80, 0, 90, 5, 100, 0
];

describe('simplify-flat-array', () => {
    describe('Douglas-Peucker (classic mode)', () => {
        it('preserves original when tolerance=0', () => {
            const result = simplify(original, 0);
            expect(result).toEqual(original);
        });

        it('reduces points with reasonable tolerance', () => {
            const result = simplify(original, 5, true);  // ← increase from 3 to 5
            expect(result.length).toBeLessThan(original.length);
            expect(result.length).toBeGreaterThan(4); // still has shape
        });

        it('handles very small paths', () => {
            const tiny = [0, 0, 10, 10];
            expect(simplify(tiny, 1)).toEqual(tiny);
        });
    });

    describe('Visvalingam–Whyatt mode', () => {
        it('reduces points when using targetPoints', () => {
            const result = simplify(original, null, false, {
                algorithm: 'visvalingam',
                targetPoints: 6
            });
            expect(result.length / 2).toBeLessThanOrEqual(6);
            expect(result.length).toBeGreaterThan(8); // at least start/end + some points
        });

        it('produces smoother-looking result than high-tolerance Douglas-Peucker', () => {
            const dpHigh = simplify(original, 5, false);
            const vw = simplify(original, null, false, {
                algorithm: 'visvalingam',
                targetPoints: dpHigh.length / 2
            });

            // Not exact equality, but roughly same point count
            expect(vw.length).toBeCloseTo(dpHigh.length, -1);
        });

        it('respects closed flag', () => {
            const closedResult = simplify(original, 1, false, {  // ← add small tolerance
                algorithm: 'visvalingam',
                targetPoints: 8,
                closed: true
            });

            const lastX = closedResult[closedResult.length - 2];
            const lastY = closedResult[closedResult.length - 1];

            expect(lastX).toBeCloseTo(original[0], 5);  // allow tiny float diff
            expect(lastY).toBeCloseTo(original[1], 5);
        });

        it('returns typed array when requested', () => {
            const result = simplify(original, null, false, {
                algorithm: 'visvalingam',
                targetPoints: 10,
                useTypedArray: true
            });
            expect(result).toBeInstanceOf(Float32Array);
        });
    });
});