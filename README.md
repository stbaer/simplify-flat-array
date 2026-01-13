# simplify-flat-array

[![npm version](https://img.shields.io/npm/v/simplify-flat-array.svg?style=flat-square)](https://www.npmjs.com/package/simplify-flat-array)
[![npm downloads](https://img.shields.io/npm/dm/simplify-flat-array.svg?style=flat-square)](https://www.npmjs.com/package/simplify-flat-array)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Lightweight 2D polyline simplification for flat coordinate arrays**  
Reduces the number of points in paths while preserving shape

Supports two popular algorithms:

- **Douglas-Peucker** (classic, fast, good for strict geometric fidelity)
- **Visvalingam–Whyatt** (usually smoother & more natural looking for hand-drawn/organic paths)

## Features

- Works directly with **flat arrays** `[x1,y1, x2,y2, ...]` (no need for object arrays)
- 100% backward compatible with original v1.0.0 API
- Optional **Visvalingam–Whyatt** mode (added in v1.1.0) – often preferred for visual quality
- Target exact number of points (Visvalingam)
- Optional `Float32Array` output (great for PixiJS `Line`, `Rope`, `Mesh`, `Graphics`)
- Closed path support (polygons, zones, formations)
- Zero dependencies (~3 KB minified)

## Installation

```bash
npm install simplify-flat-array
# or
yarn add simplify-flat-array
```

## New in v1.1.0 – Visvalingam–Whyatt support

```js
const simplify = require('simplify-flat-array');
// or
import simplify from 'simplify-flat-array';

// Classic Douglas-Peucker (same as old version)
simplify(points, 2.5, true);

// Visvalingam
simplify(points, null, false, { algorithm: 'visvalingam', tolerance: 1 });

// Target specific point count
simplify(points, null, false, { algorithm: 'visvalingam', targetPoints: 30 });
```

## API

### `simplify(points, tolerance, highQuality, options)`

### Options

- `algorithm` (default: 'douglas-peucker')
- `targetPoints` (Visvalingam only)
- `useTypedArray` (default: false)
- `closed` (default: false)

### Return value

Returns a flat array of coordinates `[x1,y1, x2,y2, ...]`.

### Performance Notes

Douglas-Peucker is significantly faster for large paths.  
Visvalingam–Whyatt provides better visual quality but can be 3–10× slower in the current implementation when reducing to low point counts.

## License
MIT © Steffen Bär