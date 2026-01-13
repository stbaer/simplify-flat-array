const simplify = require('../index.js');

// Larger realistic path (e.g. hand-drawn player movement ~200–500 points)
const generatePath = (count = 500) => {
    const points = [];
    for (let i = 0; i < count; i++) {
        points.push(i * 2, Math.sin(i * 0.1) * 30 + (i % 50 === 0 ? 40 : 0)); // some noise
    }
    return points;
};

const path500 = generatePath(500);
const path2000 = generatePath(2000);

console.log('\nBenchmark: simplify-flat-array\n');

const run = (name, fn) => {
    console.time(name);
    for (let i = 0; i < 100; i++) {
        fn();
    }
    console.timeEnd(name);
};

console.log('Input sizes:');
console.log(`  500 points  → ${path500.length / 2} pts`);
console.log(` 2000 points  → ${path2000.length / 2} pts\n`);

console.log('Douglas-Peucker (tolerance 2):');
run('DP 500 pts  ', () => simplify(path500, 2));
run('DP 2000 pts ', () => simplify(path2000, 2));

console.log('\nVisvalingam (target ~40 points):');
run('VW 500 pts  ', () => simplify(path500, null, false, { algorithm: 'visvalingam', targetPoints: 40 }));
run('VW 2000 pts ', () => simplify(path2000, null, false, { algorithm: 'visvalingam', targetPoints: 40 }));