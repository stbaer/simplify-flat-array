## simplify-flat-array

[simplify-js](https://github.com/mourner/simplify-js) for flat number arrays ([ x1, y1, x2, y2,...]).

### Install

npm i stbaer/simplify-flat-array

### Use

Like simplify-js, except for the points format. See [simplify-js demo/doku](http://mourner.github.io/simplify-js/)

`simplify(points, tolerance, highQuality)`

    - *points* - [Array] - [ x1, y1, x2, y2,...].

    - *tolerance* - [Number] (optional, 1 by default)

    - *highQuality* [Boolean] (optional, false by default) - includes distance-based processing if true

### Test

`npm run test`

The tests from simplify-js are included, only changed the points format