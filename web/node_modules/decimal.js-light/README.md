![decimal.js-light](https://raw.githubusercontent.com/MikeMcl/decimal.js-light/gh-pages/decimaljslight.png)

The light version of [decimal.js](https://github.com/MikeMcl/decimal.js/), an arbitrary-precision Decimal type for JavaScript.

[![Build Status](https://travis-ci.org/MikeMcl/decimal.js-light.svg)](https://travis-ci.org/MikeMcl/decimal.js-light)

<br />

This library is the newest of the family of libraries: [bignumber.js](https://github.com/MikeMcl/bignumber.js/), [big.js](https://github.com/MikeMcl/big.js/), [decimal.js](https://github.com/MikeMcl/decimal.js/) and *decimal.js-light*.<br>
The API is more or less a subset of the API of *decimal.js*.

![API](https://raw.githubusercontent.com/MikeMcl/decimal.js-light/gh-pages/API.png)

__Differences between this library and *decimal.js*__

Size of *decimal.js* minified: 32.1 KB.<br>
Size of *decimal.js-light* minified: 12.7 KB.

This library does not include `NaN`, `Infinity` or `-0` as legitimate values, or work with values in other bases.

Here, the `Decimal.round` property is just the default rounding mode for `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`. It does not apply to arithmetic operations, which are simply truncated at the required precision.

If rounding is required just apply it explicitly, for example

```js
x = new Decimal(2);
y = new Decimal(3);

// decimal.js
x.dividedBy(y).toString();                       // '0.66666666666666666667'

// decimal.js-light
x.dividedBy(y).toString();                       // '0.66666666666666666666'
x.dividedBy(y).toDecimalPlaces(19).toString();   // '0.6666666666666666667'
```

The `naturalExponential`, `naturalLogarithm`, `logarithm`, and `toPower` methods in this library have by default a limited precision of around 100 digits. This limit can be increased at runtime using the `LN10` (the natural logarithm of ten) configuration object property.

For example, if a maximum precision of 400 digits is required for these operations use

```js
// 415 digits
Decimal.set({
  LN10: '2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286248633409525465082806756666287369098781689482907208325554680843799894826233198528393505308965377732628846163366222287698219886746543667474404243274365155048934314939391479619404400222105101714174800368808401264708068556774321622835522011480466371565912137345074785694768346361679210180644507064800027'
});
```

Also, in this library the `e` property of a Decimal is the base 10000000 exponent, not the base 10 exponent as in *decimal.js*.<br>
Use the `exponent` method to get the base 10 exponent.

## Quickstart

Browser:

```html
<script src='path/to/decimal.js-light'></script>
```

Node package manager:

```shell
$ npm install --save decimal.js-light
```

```js
// Node.js
var Decimal = require('decimal.js-light');

// Adjust the global configuration if required (these are the defaults)
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21
});

phi = new Decimal('1.61803398874989484820458683436563811772030917980576');

phi.toFixed(10);    // '1.6180339887'

phi.times(2).minus(1).toPower(2).plus('1e-19').equals(5);    // true

```

See the [documentation](http://mikemcl.github.io/decimal.js-light) for further information.

[TypeScript](https://github.com/Microsoft/TypeScript) type declaration file contributed by [TANAKA Koichi](https://github.com/MugeSo).





