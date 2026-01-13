/**
 * Simplifies a flat 2D coordinate array [x1,y1, x2,y2, ...] using Douglas-Peucker
 * or Visvalingam-Whyatt algorithm.
 *
 * Original Douglas-Peucker implementation adapted from simplify-js (mourner).
 * Visvalingam-Whyatt added for smoother, more natural results.
 *
 * @param {number[]|Float32Array} points - flat array of coordinates
 * @param {number} [tolerance=1] - simplification tolerance (Douglas-Peucker only)
 * @param {boolean} [highQuality=false] - better quality for Douglas-Peucker
 * @param {Object} [options] - optional modern configuration
 * @param {'douglas-peucker'|'visvalingam'} [options.algorithm='douglas-peucker']
 * @param {number} [options.targetPoints] - desired number of points (visvalingam only, overrides tolerance)
 * @param {boolean} [options.useTypedArray=false] - return Float32Array instead of Array
 * @param {boolean} [options.closed=false] - treat as closed polygon (mainly affects visvalingam)
 * @returns {number[]|Float32Array} simplified flat path
 */
function simplify(points, tolerance = 1, highQuality = false, options = {}) {
    if (!Array.isArray(points) && !(points instanceof Float32Array)) {
        return points.slice ? points.slice() : Array.from(points);
    }

    if (points.length < 6) {
        return Array.from(points);
    }

    const isClassicCall = arguments.length <= 3 || !options || !options.algorithm;

    const {
        algorithm = 'douglas-peucker',
        targetPoints = null,
        useTypedArray = false,
        closed = false
    } = options;

    const pts = Array.from(points); // safe working copy

    let result;

    if (isClassicCall || algorithm === 'douglas-peucker') {
        result = simplifyDouglasPeucker(pts, tolerance, highQuality);
    } else if (algorithm === 'visvalingam') {
        result = simplifyVisvalingam(pts, { targetPoints, tolerance, closed });
    } else {
        // fallback to original behavior on unknown algorithm
        result = simplifyDouglasPeucker(pts, tolerance, highQuality);
    }

    return useTypedArray ? new Float32Array(result) : result;
}

function simplifyDouglasPeucker(points, tolerance, highQuality) {
    const len = points.length;
    if (len < 6) return points.slice();

    const result = [];

    // Explicitly add the first point (critical for tolerance=0)
    result.push(points[0], points[1]);

    // Recurse over the rest (from index 0 to len-2)
    simplifyDP(points, 0, len - 2, tolerance, result);

    // Add last point only if not already added (but in practice always add)
    if (result[result.length - 2] !== points[len - 2] ||
        result[result.length - 1] !== points[len - 1]) {
        result.push(points[len - 2], points[len - 1]);
    }

    return result;
}

function simplifyDP(points, first, last, tolerance, result) {
    let maxDist = 0;
    let index = 0;

    const x1 = points[first];
    const y1 = points[first + 1];
    const x2 = points[last];
    const y2 = points[last + 1];

    for (let i = first + 2; i < last; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        const dist = perpendicularDistance(x, y, x1, y1, x2, y2);

        if (dist > maxDist) {
            index = i;
            maxDist = dist;
        }
    }

    if (maxDist > tolerance) {
        simplifyDP(points, first, index, tolerance, result);
        result.push(points[index], points[index + 1]);
        simplifyDP(points, index, last, tolerance, result);
    }
}

function perpendicularDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
        return Math.hypot(px - x1, py - y1);
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    return Math.hypot(px - projX, py - projY);
}

/**
 * Visvalingam-Whyatt line simplification
 */
function simplifyVisvalingam(points, { targetPoints = null, tolerance = 0.5, closed = false }) {
    const n = points.length >> 1;
    if (n < 3) return points.slice();

    // Effective area for each point (Infinity = endpoint)
    const areas = new Array(n).fill(Infinity);
    const prev = new Array(n);
    const next = new Array(n);

    // Initialize linked list
    for (let i = 0; i < n; i++) {
        prev[i] = i - 1;
        next[i] = i + 1;
    }
    prev[0] = null;
    next[n - 1] = null;

    // Calculate initial triangle areas (skip endpoints)
    for (let i = 1; i < n - 1; i++) {
        areas[i] = triangleArea(
            points[(i - 1) * 2], points[(i - 1) * 2 + 1],
            points[i * 2], points[i * 2 + 1],
            points[(i + 1) * 2], points[(i + 1) * 2 + 1]
        );
    }

    // Handle closed path (connect last → first → second)
    if (closed && n > 3) {
        areas[0] = triangleArea(
            points[(n - 1) * 2], points[(n - 1) * 2 + 1],
            points[0], points[1],
            points[2], points[3]
        );
        areas[n - 1] = triangleArea(
            points[(n - 2) * 2], points[(n - 2) * 2 + 1],
            points[(n - 1) * 2], points[(n - 1) * 2 + 1],
            points[0], points[1]
        );
        next[n - 1] = 0;
        prev[0] = n - 1;
    }

    let remaining = n;
    let minIdx;

    while (remaining > 3 && (targetPoints === null || remaining > targetPoints)) {
        // Find point with smallest effective area
        let minArea = Infinity;
        minIdx = -1;

        for (let i = 0; i < n; i++) {
            if (areas[i] !== null && areas[i] < minArea) {
                minArea = areas[i];
                minIdx = i;
            }
        }

        if (minArea > tolerance && targetPoints === null) {
            break;
        }

        if (minIdx === -1 || minIdx === 0 || minIdx === n - 1) break;

        // Remove the point
        const pPrev = prev[minIdx];
        const pNext = next[minIdx];

        if (pPrev === null || pNext === null) break;

        next[pPrev] = pNext;
        prev[pNext] = pPrev;

        areas[minIdx] = null;
        remaining--;

        // Recalculate areas for the two affected neighbors
        if (pPrev !== null && areas[pPrev] !== null && pPrev !== 0) {
            areas[pPrev] = triangleArea(
                points[(prev[pPrev] * 2)], points[(prev[pPrev] * 2) + 1],
                points[pPrev * 2], points[pPrev * 2 + 1],
                points[pNext * 2], points[pNext * 2 + 1]
            );
        }

        if (pNext !== null && areas[pNext] !== null && pNext !== n - 1) {
            areas[pNext] = triangleArea(
                points[(pPrev * 2)], points[(pPrev * 2) + 1],
                points[pNext * 2], points[pNext * 2 + 1],
                points[(next[pNext] * 2)], points[(next[pNext] * 2) + 1]
            );
        }
    }

    // Build result from remaining points
    const result = [];
    let current = 0; // always start from first point

    do {
        result.push(points[current * 2], points[current * 2 + 1]);
        current = next[current];
        if (current === null) break;
    } while (current !== 0); // loop until back to start (for closed)

    // For closed paths: force close by duplicating first point at end
    if (closed && result.length >= 4) {
        result.push(result[0], result[1]);
    }

    return result;
}

function triangleArea(x1, y1, x2, y2, x3, y3) {
    return Math.abs(
        (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2
    );
}

module.exports = simplify;