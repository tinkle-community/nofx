/*
 *  decimal.js-light v2.5.1
 *  An arbitrary-precision Decimal type for JavaScript.
 *  https://github.com/MikeMcl/decimal.js-light
 *  Copyright (c) 2020 Michael Mclaughlin <M8ch88l@gmail.com>
 *  MIT Expat Licence
 */


// ------------------------------------  EDITABLE DEFAULTS  ------------------------------------- //


// The limit on the value of `precision`, and on the value of the first argument to
// `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`.
var MAX_DIGITS = 1e9,                        // 0 to 1e9


  // The initial configuration properties of the Decimal constructor.
  defaults = {

    // These values must be integers within the stated ranges (inclusive).
    // Most of these values can be changed during run-time using `Decimal.config`.

    // The maximum number of significant digits of the result of a calculation or base conversion.
    // E.g. `Decimal.config({ precision: 20 });`
    precision: 20,                         // 1 to MAX_DIGITS

    // The rounding mode used by default by `toInteger`, `toDecimalPlaces`, `toExponential`,
    // `toFixed`, `toPrecision` and `toSignificantDigits`.
    //
    // ROUND_UP         0 Away from zero.
    // ROUND_DOWN       1 Towards zero.
    // ROUND_CEIL       2 Towards +Infinity.
    // ROUND_FLOOR      3 Towards -Infinity.
    // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
    // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
    // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
    // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
    // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
    //
    // E.g.
    // `Decimal.rounding = 4;`
    // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
    rounding: 4,                           // 0 to 8

    // The exponent value at and beneath which `toString` returns exponential notation.
    // JavaScript numbers: -7
    toExpNeg: -7,                          // 0 to -MAX_E

    // The exponent value at and above which `toString` returns exponential notation.
    // JavaScript numbers: 21
    toExpPos:  21,                         // 0 to MAX_E

    // The natural logarithm of 10.
    // 115 digits
    LN10: '2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286'
  },


// ------------------------------------ END OF EDITABLE DEFAULTS -------------------------------- //


  Decimal,
  external = true,

  decimalError = '[DecimalError] ',
  invalidArgument = decimalError + 'Invalid argument: ',
  exponentOutOfRange = decimalError + 'Exponent out of range: ',

  mathfloor = Math.floor,
  mathpow = Math.pow,

  isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,

  ONE,
  BASE = 1e7,
  LOG_BASE = 7,
  MAX_SAFE_INTEGER = 9007199254740991,
  MAX_E = mathfloor(MAX_SAFE_INTEGER / LOG_BASE),    // 1286742750677284

  // Decimal.prototype object
  P = {};


// Decimal prototype methods


/*
 *  absoluteValue                       abs
 *  comparedTo                          cmp
 *  decimalPlaces                       dp
 *  dividedBy                           div
 *  dividedToIntegerBy                  idiv
 *  equals                              eq
 *  exponent
 *  greaterThan                         gt
 *  greaterThanOrEqualTo                gte
 *  isInteger                           isint
 *  isNegative                          isneg
 *  isPositive                          ispos
 *  isZero
 *  lessThan                            lt
 *  lessThanOrEqualTo                   lte
 *  logarithm                           log
 *  minus                               sub
 *  modulo                              mod
 *  naturalExponential                  exp
 *  naturalLogarithm                    ln
 *  negated                             neg
 *  plus                                add
 *  precision                           sd
 *  squareRoot                          sqrt
 *  times                               mul
 *  toDecimalPlaces                     todp
 *  toExponential
 *  toFixed
 *  toInteger                           toint
 *  toNumber
 *  toPower                             pow
 *  toPrecision
 *  toSignificantDigits                 tosd
 *  toString
 *  valueOf                             val
 */


/*
 * Return a new Decimal whose value is the absolute value of this Decimal.
 *
 */
P.absoluteValue = P.abs = function () {
  var x = new this.constructor(this);
  if (x.s) x.s = 1;
  return x;
};


/*
 * Return
 *   1    if the value of this Decimal is greater than the value of `y`,
 *  -1    if the value of this Decimal is less than the value of `y`,
 *   0    if they have the same value
 *
 */
P.comparedTo = P.cmp = function (y) {
  var i, j, xdL, ydL,
    x = this;

  y = new x.constructor(y);

  // Signs differ?
  if (x.s !== y.s) return x.s || -y.s;

  // Compare exponents.
  if (x.e !== y.e) return x.e > y.e ^ x.s < 0 ? 1 : -1;

  xdL = x.d.length;
  ydL = y.d.length;

  // Compare digit by digit.
  for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
    if (x.d[i] !== y.d[i]) return x.d[i] > y.d[i] ^ x.s < 0 ? 1 : -1;
  }

  // Compare lengths.
  return xdL === ydL ? 0 : xdL > ydL ^ x.s < 0 ? 1 : -1;
};


/*
 * Return the number of decimal places of the value of this Decimal.
 *
 */
P.decimalPlaces = P.dp = function () {
  var x = this,
    w = x.d.length - 1,
    dp = (w - x.e) * LOG_BASE;

  // Subtract the number of trailing zeros of the last word.
  w = x.d[w];
  if (w) for (; w % 10 == 0; w /= 10) dp--;

  return dp < 0 ? 0 : dp;
};


/*
 * Return a new Decimal whose value is the value of this Decimal divided by `y`, truncated to
 * `precision` significant digits.
 *
 */
P.dividedBy = P.div = function (y) {
  return divide(this, new this.constructor(y));
};


/*
 * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
 * by the value of `y`, truncated to `precision` significant digits.
 *
 */
P.dividedToIntegerBy = P.idiv = function (y) {
  var x = this,
    Ctor = x.constructor;
  return round(divide(x, new Ctor(y), 0, 1), Ctor.precision);
};


/*
 * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
 *
 */
P.equals = P.eq = function (y) {
  return !this.cmp(y);
};


/*
 * Return the (base 10) exponent value of this Decimal (this.e is the base 10000000 exponent).
 *
 */
P.exponent = function () {
  return getBase10Exponent(this);
};


/*
 * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
 * false.
 *
 */
P.greaterThan = P.gt = function (y) {
  return this.cmp(y) > 0;
};


/*
 * Return true if the value of this Decimal is greater than or equal to the value of `y`,
 * otherwise return false.
 *
 */
P.greaterThanOrEqualTo = P.gte = function (y) {
  return this.cmp(y) >= 0;
};


/*
 * Return true if the value of this Decimal is an integer, otherwise return false.
 *
 */
P.isInteger = P.isint = function () {
  return this.e > this.d.length - 2;
};


/*
 * Return true if the value of this Decimal is negative, otherwise return false.
 *
 */
P.isNegative = P.isneg = function () {
  return this.s < 0;
};


/*
 * Return true if the value of this Decimal is positive, otherwise return false.
 *
 */
P.isPositive = P.ispos = function () {
  return this.s > 0;
};


/*
 * Return true if the value of this Decimal is 0, otherwise return false.
 *
 */
P.isZero = function () {
  return this.s === 0;
};


/*
 * Return true if the value of this Decimal is less than `y`, otherwise return false.
 *
 */
P.lessThan = P.lt = function (y) {
  return this.cmp(y) < 0;
};


/*
 * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
 *
 */
P.lessThanOrEqualTo = P.lte = function (y) {
  return this.cmp(y) < 1;
};


/*
 * Return the logarithm of the value of this Decimal to the specified base, truncated to
 * `precision` significant digits.
 *
 * If no base is specified, return log[10](x).
 *
 * log[base](x) = ln(x) / ln(base)
 *
 * The maximum error of the result is 1 ulp (unit in the last place).
 *
 * [base] {number|string|Decimal} The base of the logarithm.
 *
 */
P.logarithm = P.log = function (base) {
  var r,
    x = this,
    Ctor = x.constructor,
    pr = Ctor.precision,
    wpr = pr + 5;

  // Default base is 10.
  if (base === void 0) {
    base = new Ctor(10);
  } else {
    base = new Ctor(base);

    // log[-b](x) = NaN
    // log[0](x)  = NaN
    // log[1](x)  = NaN
    if (base.s < 1 || base.eq(ONE)) throw Error(decimalError + 'NaN');
  }

  // log[b](-x) = NaN
  // log[b](0) = -Infinity
  if (x.s < 1) throw Error(decimalError + (x.s ? 'NaN' : '-Infinity'));

  // log[b](1) = 0
  if (x.eq(ONE)) return new Ctor(0);

  external = false;
  r = divide(ln(x, wpr), ln(base, wpr), wpr);
  external = true;

  return round(r, pr);
};


/*
 * Return a new Decimal whose value is the value of this Decimal minus `y`, truncated to
 * `precision` significant digits.
 *
 */
P.minus = P.sub = function (y) {
  var x = this;
  y = new x.constructor(y);
  return x.s == y.s ? subtract(x, y) : add(x, (y.s = -y.s, y));
};


/*
 * Return a new Decimal whose value is the value of this Decimal modulo `y`, truncated to
 * `precision` significant digits.
 *
 */
P.modulo = P.mod = function (y) {
  var q,
    x = this,
    Ctor = x.constructor,
    pr = Ctor.precision;

  y = new Ctor(y);

  // x % 0 = NaN
  if (!y.s) throw Error(decimalError + 'NaN');

  // Return x if x is 0.
  if (!x.s) return round(new Ctor(x), pr);

  // Prevent rounding of intermediate calculations.
  external = false;
  q = divide(x, y, 0, 1).times(y);
  external = true;

  return x.minus(q);
};


/*
 * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
 * i.e. the base e raised to the power the value of this Decimal, truncated to `precision`
 * significant digits.
 *
 */
P.naturalExponential = P.exp = function () {
  return exp(this);
};


/*
 * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
 * truncated to `precision` significant digits.
 *
 */
P.naturalLogarithm = P.ln = function () {
  return ln(this);
};


/*
 * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
 * -1.
 *
 */
P.negated = P.neg = function () {
  var x = new this.constructor(this);
  x.s = -x.s || 0;
  return x;
};


/*
 * Return a new Decimal whose value is the value of this Decimal plus `y`, truncated to
 * `precision` significant digits.
 *
 */
P.plus = P.add = function (y) {
  var x = this;
  y = new x.constructor(y);
  return x.s == y.s ? add(x, y) : subtract(x, (y.s = -y.s, y));
};


/*
 * Return the number of significant digits of the value of this Decimal.
 *
 * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
 *
 */
P.precision = P.sd = function (z) {
  var e, sd, w,
    x = this;

  if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);

  e = getBase10Exponent(x) + 1;
  w = x.d.length - 1;
  sd = w * LOG_BASE + 1;
  w = x.d[w];

  // If non-zero...
  if (w) {

    // Subtract the number of trailing zeros of the last word.
    for (; w % 10 == 0; w /= 10) sd--;

    // Add the number of digits of the first word.
    for (w = x.d[0]; w >= 10; w /= 10) sd++;
  }

  return z && e > sd ? e : sd;
};


/*
 * Return a new Decimal whose value is the square root of this Decimal, truncated to `precision`
 * significant digits.
 *
 */
P.squareRoot = P.sqrt = function () {
  var e, n, pr, r, s, t, wpr,
    x = this,
    Ctor = x.constructor;

  // Negative or zero?
  if (x.s < 1) {
    if (!x.s) return new Ctor(0);

    // sqrt(-x) = NaN
    throw Error(decimalError + 'NaN');
  }

  e = getBase10Exponent(x);
  external = false;

  // Initial estimate.
  s = Math.sqrt(+x);

  // Math.sqrt underflow/overflow?
  // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
  if (s == 0 || s == 1 / 0) {
    n = digitsToString(x.d);
    if ((n.length + e) % 2 == 0) n += '0';
    s = Math.sqrt(n);
    e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);

    if (s == 1 / 0) {
      n = '5e' + e;
    } else {
      n = s.toExponential();
      n = n.slice(0, n.indexOf('e') + 1) + e;
    }

    r = new Ctor(n);
  } else {
    r = new Ctor(s.toString());
  }

  pr = Ctor.precision;
  s = wpr = pr + 3;

  // Newton-Raphson iteration.
  for (;;) {
    t = r;
    r = t.plus(divide(x, t, wpr + 2)).times(0.5);

    if (digitsToString(t.d).slice(0, wpr) === (n = digitsToString(r.d)).slice(0, wpr)) {
      n = n.slice(wpr - 3, wpr + 1);

      // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or
      // 4999, i.e. approaching a rounding boundary, continue the iteration.
      if (s == wpr && n == '4999') {

        // On the first iteration only, check to see if rounding up gives the exact result as the
        // nines may infinitely repeat.
        round(t, pr + 1, 0);

        if (t.times(t).eq(x)) {
          r = t;
          break;
        }
      } else if (n != '9999') {
        break;
      }

      wpr += 4;
    }
  }

  external = true;

  return round(r, pr);
};


/*
 * Return a new Decimal whose value is the value of this Decimal times `y`, truncated to
 * `precision` significant digits.
 *
 */
P.times = P.mul = function (y) {
  var carry, e, i, k, r, rL, t, xdL, ydL,
    x = this,
    Ctor = x.constructor,
    xd = x.d,
    yd = (y = new Ctor(y)).d;

  // Return 0 if either is 0.
  if (!x.s || !y.s) return new Ctor(0);

  y.s *= x.s;
  e = x.e + y.e;
  xdL = xd.length;
  ydL = yd.length;

  // Ensure xd points to the longer array.
  if (xdL < ydL) {
    r = xd;
    xd = yd;
    yd = r;
    rL = xdL;
    xdL = ydL;
    ydL = rL;
  }

  // Initialise the result array with zeros.
  r = [];
  rL = xdL + ydL;
  for (i = rL; i--;) r.push(0);

  // Multiply!
  for (i = ydL; --i >= 0;) {
    carry = 0;
    for (k = xdL + i; k > i;) {
      t = r[k] + yd[i] * xd[k - i - 1] + carry;
      r[k--] = t % BASE | 0;
      carry = t / BASE | 0;
    }

    r[k] = (r[k] + carry) % BASE | 0;
  }

  // Remove trailing zeros.
  for (; !r[--rL];) r.pop();

  if (carry) ++e;
  else r.shift();

  y.d = r;
  y.e = e;

  return external ? round(y, Ctor.precision) : y;
};


/*
 * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
 * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
 *
 * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
 *
 * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
 * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
 *
 */
P.toDecimalPlaces = P.todp = function (dp, rm) {
  var x = this,
    Ctor = x.constructor;

  x = new Ctor(x);
  if (dp === void 0) return x;

  checkInt32(dp, 0, MAX_DIGITS);

  if (rm === void 0) rm = Ctor.rounding;
  else checkInt32(rm, 0, 8);

  return round(x, dp + getBase10Exponent(x) + 1, rm);
};


/*
 * Return a string representing the value of this Decimal in exponential notation rounded to
 * `dp` fixed decimal places using rounding mode `rounding`.
 *
 * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
 * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
 *
 */
P.toExponential = function (dp, rm) {
  var str,
    x = this,
    Ctor = x.constructor;

  if (dp === void 0) {
    str = toString(x, true);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);

    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);

    x = round(new Ctor(x), dp + 1, rm);
    str = toString(x, true, dp + 1);
  }

  return str;
};


/*
 * Return a string representing the value of this Decimal in normal (fixed-point) notation to
 * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
 * omitted.
 *
 * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
 *
 * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
 * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
 *
 * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
 * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
 * (-0).toFixed(3) is '0.000'.
 * (-0.5).toFixed(0) is '-0'.
 *
 */
P.toFixed = function (dp, rm) {
  var str, y,
    x = this,
    Ctor = x.constructor;

  if (dp === void 0) return toString(x);

  checkInt32(dp, 0, MAX_DIGITS);

  if (rm === void 0) rm = Ctor.rounding;
  else checkInt32(rm, 0, 8);

  y = round(new Ctor(x), dp + getBase10Exponent(x) + 1, rm);
  str = toString(y.abs(), false, dp + getBase10Exponent(y) + 1);

  // To determine whether to add the minus sign look at the value before it was rounded,
  // i.e. look at `x` rather than `y`.
  return x.isneg() && !x.isZero() ? '-' + str : str;
};


/*
 * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
 * rounding mode `rounding`.
 *
 */
P.toInteger = P.toint = function () {
  var x = this,
    Ctor = x.constructor;
  return round(new Ctor(x), getBase10Exponent(x) + 1, Ctor.rounding);
};


/*
 * Return the value of this Decimal converted to a number primitive.
 *
 */
P.toNumber = function () {
  return +this;
};


/*
 * Return a new Decimal whose value is the value of this Decimal raised to the power `y`,
 * truncated to `precision` significant digits.
 *
 * For non-integer or very large exponents pow(x, y) is calculated using
 *
 *   x^y = exp(y*ln(x))
 *
 * The maximum error is 1 ulp (unit in last place).
 *
 * y {number|string|Decimal} The power to which to raise this Decimal.
 *
 */
P.toPower = P.pow = function (y) {
  var e, k, pr, r, sign, yIsInt,
    x = this,
    Ctor = x.constructor,
    guard = 12,
    yn = +(y = new Ctor(y));

  // pow(x, 0) = 1
  if (!y.s) return new Ctor(ONE);

  x = new Ctor(x);

  // pow(0, y > 0) = 0
  // pow(0, y < 0) = Infinity
  if (!x.s) {
    if (y.s < 1) throw Error(decimalError + 'Infinity');
    return x;
  }

  // pow(1, y) = 1
  if (x.eq(ONE)) return x;

  pr = Ctor.precision;

  // pow(x, 1) = x
  if (y.eq(ONE)) return round(x, pr);

  e = y.e;
  k = y.d.length - 1;
  yIsInt = e >= k;
  sign = x.s;

  if (!yIsInt) {

    // pow(x < 0, y non-integer) = NaN
    if (sign < 0) throw Error(decimalError + 'NaN');

  // If y is a small integer use the 'exponentiation by squaring' algorithm.
  } else if ((k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
    r = new Ctor(ONE);

    // Max k of 9007199254740991 takes 53 loop iterations.
    // Maximum digits array length; leaves [28, 34] guard digits.
    e = Math.ceil(pr / LOG_BASE + 4);

    external = false;

    for (;;) {
      if (k % 2) {
        r = r.times(x);
        truncate(r.d, e);
      }

      k = mathfloor(k / 2);
      if (k === 0) break;

      x = x.times(x);
      truncate(x.d, e);
    }

    external = true;

    return y.s < 0 ? new Ctor(ONE).div(r) : round(r, pr);
  }

  // Result is negative if x is negative and the last digit of integer y is odd.
  sign = sign < 0 && y.d[Math.max(e, k)] & 1 ? -1 : 1;

  x.s = 1;
  external = false;
  r = y.times(ln(x, pr + guard));
  external = true;
  r = exp(r);
  r.s = sign;

  return r;
};


/*
 * Return a string representing the value of this Decimal rounded to `sd` significant digits
 * using rounding mode `rounding`.
 *
 * Return exponential notation if `sd` is less than the number of digits necessary to represent
 * the integer part of the value in normal notation.
 *
 * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
 * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
 *
 */
P.toPrecision = function (sd, rm) {
  var e, str,
    x = this,
    Ctor = x.constructor;

  if (sd === void 0) {
    e = getBase10Exponent(x);
    str = toString(x, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
  } else {
    checkInt32(sd, 1, MAX_DIGITS);

    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);

    x = round(new Ctor(x), sd, rm);
    e = getBase10Exponent(x);
    str = toString(x, sd <= e || e <= Ctor.toExpNeg, sd);
  }

  return str;
};


/*
 * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
 * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
 * omitted.
 *
 * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
 * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
 *
 */
P.toSignificantDigits = P.tosd = function (sd, rm) {
  var x = this,
    Ctor = x.constructor;

  if (sd === void 0) {
    sd = Ctor.precision;
    rm = Ctor.rounding;
  } else {
    checkInt32(sd, 1, MAX_DIGITS);

    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
  }

  return round(new Ctor(x), sd, rm);
};


/*
 * Return a string representing the value of this Decimal.
 *
 * Return exponential notation if this Decimal has a positive exponent equal to or greater than
 * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
 *
 */
P.toString = P.valueOf = P.val = P.toJSON = P[Symbol.for('nodejs.util.inspect.custom')] = function () {
  var x = this,
    e = getBase10Exponent(x),
    Ctor = x.constructor;

  return toString(x, e <= Ctor.toExpNeg || e >= Ctor.toExpPos);
};


// Helper functions for Decimal.prototype (P) and/or Decimal methods, and their callers.


/*
 *  add                 P.minus, P.plus
 *  checkInt32          P.todp, P.toExponential, P.toFixed, P.toPrecision, P.tosd
 *  digitsToString      P.log, P.sqrt, P.pow, toString, exp, ln
 *  divide              P.div, P.idiv, P.log, P.mod, P.sqrt, exp, ln
 *  exp                 P.exp, P.pow
 *  getBase10Exponent   P.exponent, P.sd, P.toint, P.sqrt, P.todp, P.toFixed, P.toPrecision,
 *                      P.toString, divide, round, toString, exp, ln
 *  getLn10             P.log, ln
 *  getZeroString       digitsToString, toString
 *  ln                  P.log, P.ln, P.pow, exp
 *  parseDecimal        Decimal
 *  round               P.abs, P.idiv, P.log, P.minus, P.mod, P.neg, P.plus, P.toint, P.sqrt,
 *                      P.times, P.todp, P.toExponential, P.toFixed, P.pow, P.toPrecision, P.tosd,
 *                      divide, getLn10, exp, ln
 *  subtract            P.minus, P.plus
 *  toString            P.toExponential, P.toFixed, P.toPrecision, P.toString, P.valueOf
 *  truncate            P.pow
 *
 *  Throws:             P.log, P.mod, P.sd, P.sqrt, P.pow,  checkInt32, divide, round,
 *                      getLn10, exp, ln, parseDecimal, Decimal, config
 */


function add(x, y) {
  var carry, d, e, i, k, len, xd, yd,
    Ctor = x.constructor,
    pr = Ctor.precision;

  // If either is zero...
  if (!x.s || !y.s) {

    // Return x if y is zero.
    // Return y if y is non-zero.
    if (!y.s) y = new Ctor(x);
    return external ? round(y, pr) : y;
  }

  xd = x.d;
  yd = y.d;

  // x and y are finite, non-zero numbers with the same sign.

  k = x.e;
  e = y.e;
  xd = xd.slice();
  i = k - e;

  // If base 1e7 exponents differ...
  if (i) {
    if (i < 0) {
      d = xd;
      i = -i;
      len = yd.length;
    } else {
      d = yd;
      e = k;
      len = xd.length;
    }

    // Limit number of zeros prepended to max(ceil(pr / LOG_BASE), len) + 1.
    k = Math.ceil(pr / LOG_BASE);
    len = k > len ? k + 1 : len + 1;

    if (i > len) {
      i = len;
      d.length = 1;
    }

    // Prepend zeros to equalise exponents. Note: Faster to use reverse then do unshifts.
    d.reverse();
    for (; i--;) d.push(0);
    d.reverse();
  }

  len = xd.length;
  i = yd.length;

  // If yd is longer than xd, swap xd and yd so xd points to the longer array.
  if (len - i < 0) {
    i = len;
    d = yd;
    yd = xd;
    xd = d;
  }

  // Only start adding at yd.length - 1 as the further digits of xd can be left as they are.
  for (carry = 0; i;) {
    carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
    xd[i] %= BASE;
  }

  if (carry) {
    xd.unshift(carry);
    ++e;
  }

  // Remove trailing zeros.
  // No need to check for zero, as +x + +y != 0 && -x + -y != 0
  for (len = xd.length; xd[--len] == 0;) xd.pop();

  y.d = xd;
  y.e = e;

  return external ? round(y, pr) : y;
}


function checkInt32(i, min, max) {
  if (i !== ~~i || i < min || i > max) {
    throw Error(invalidArgument + i);
  }
}


function digitsToString(d) {
  var i, k, ws,
    indexOfLastWord = d.length - 1,
    str = '',
    w = d[0];

  if (indexOfLastWord > 0) {
    str += w;
    for (i = 1; i < indexOfLastWord; i++) {
      ws = d[i] + '';
      k = LOG_BASE - ws.length;
      if (k) str += getZeroString(k);
      str += ws;
    }

    w = d[i];
    ws = w + '';
    k = LOG_BASE - ws.length;
    if (k) str += getZeroString(k);
  } else if (w === 0) {
    return '0';
  }

  // Remove trailing zeros of last w.
  for (; w % 10 === 0;) w /= 10;

  return str + w;
}


var divide = (function () {

  // Assumes non-zero x and k, and hence non-zero result.
  function multiplyInteger(x, k) {
    var temp,
      carry = 0,
      i = x.length;

    for (x = x.slice(); i--;) {
      temp = x[i] * k + carry;
      x[i] = temp % BASE | 0;
      carry = temp / BASE | 0;
    }

    if (carry) x.unshift(carry);

    return x;
  }

  function compare(a, b, aL, bL) {
    var i, r;

    if (aL != bL) {
      r = aL > bL ? 1 : -1;
    } else {
      for (i = r = 0; i < aL; i++) {
        if (a[i] != b[i]) {
          r = a[i] > b[i] ? 1 : -1;
          break;
        }
      }
    }

    return r;
  }

  function subtract(a, b, aL) {
    var i = 0;

    // Subtract b from a.
    for (; aL--;) {
      a[aL] -= i;
      i = a[aL] < b[aL] ? 1 : 0;
      a[aL] = i * BASE + a[aL] - b[aL];
    }

    // Remove leading zeros.
    for (; !a[0] && a.length > 1;) a.shift();
  }

  return function (x, y, pr, dp) {
    var cmp, e, i, k, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz,
      Ctor = x.constructor,
      sign = x.s == y.s ? 1 : -1,
      xd = x.d,
      yd = y.d;

    // Either 0?
    if (!x.s) return new Ctor(x);
    if (!y.s) throw Error(decimalError + 'Division by zero');

    e = x.e - y.e;
    yL = yd.length;
    xL = xd.length;
    q = new Ctor(sign);
    qd = q.d = [];

    // Result exponent may be one less than e.
    for (i = 0; yd[i] == (xd[i] || 0); ) ++i;
    if (yd[i] > (xd[i] || 0)) --e;

    if (pr == null) {
      sd = pr = Ctor.precision;
    } else if (dp) {
      sd = pr + (getBase10Exponent(x) - getBase10Exponent(y)) + 1;
    } else {
      sd = pr;
    }

    if (sd < 0) return new Ctor(0);

    // Convert precision in number of base 10 digits to base 1e7 digits.
    sd = sd / LOG_BASE + 2 | 0;
    i = 0;

    // divisor < 1e7
    if (yL == 1) {
      k = 0;
      yd = yd[0];
      sd++;

      // k is the carry.
      for (; (i < xL || k) && sd--; i++) {
        t = k * BASE + (xd[i] || 0);
        qd[i] = t / yd | 0;
        k = t % yd | 0;
      }

    // divisor >= 1e7
    } else {

      // Normalise xd and yd so highest order digit of yd is >= BASE/2
      k = BASE / (yd[0] + 1) | 0;

      if (k > 1) {
        yd = multiplyInteger(yd, k);
        xd = multiplyInteger(xd, k);
        yL = yd.length;
        xL = xd.length;
      }

      xi = yL;
      rem = xd.slice(0, yL);
      remL = rem.length;

      // Add zeros to make remainder as long as divisor.
      for (; remL < yL;) rem[remL++] = 0;

      yz = yd.slice();
      yz.unshift(0);
      yd0 = yd[0];

      if (yd[1] >= BASE / 2) ++yd0;

      do {
        k = 0;

        // Compare divisor and remainder.
        cmp = compare(yd, rem, yL, remL);

        // If divisor < remainder.
        if (cmp < 0) {

          // Calculate trial digit, k.
          rem0 = rem[0];
          if (yL != remL) rem0 = rem0 * BASE + (rem[1] || 0);

          // k will be how many times the divisor goes into the current remainder.
          k = rem0 / yd0 | 0;

          //  Algorithm:
          //  1. product = divisor * trial digit (k)
          //  2. if product > remainder: product -= divisor, k--
          //  3. remainder -= product
          //  4. if product was < remainder at 2:
          //    5. compare new remainder and divisor
          //    6. If remainder > divisor: remainder -= divisor, k++

          if (k > 1) {
            if (k >= BASE) k = BASE - 1;

            // product = divisor * trial digit.
            prod = multiplyInteger(yd, k);
            prodL = prod.length;
            remL = rem.length;

            // Compare product and remainder.
            cmp = compare(prod, rem, prodL, remL);

            // product > remainder.
            if (cmp == 1) {
              k--;

              // Subtract divisor from product.
              subtract(prod, yL < prodL ? yz : yd, prodL);
            }
          } else {

            // cmp is -1.
            // If k is 0, there is no need to compare yd and rem again below, so change cmp to 1
            // to avoid it. If k is 1 there is a need to compare yd and rem again below.
            if (k == 0) cmp = k = 1;
            prod = yd.slice();
          }

          prodL = prod.length;
          if (prodL < remL) prod.unshift(0);

          // Subtract product from remainder.
          subtract(rem, prod, remL);

          // If product was < previous remainder.
          if (cmp == -1) {
            remL = rem.length;

            // Compare divisor and new remainder.
            cmp = compare(yd, rem, yL, remL);

            // If divisor < new remainder, subtract divisor from remainder.
            if (cmp < 1) {
              k++;

              // Subtract divisor from remainder.
              subtract(rem, yL < remL ? yz : yd, remL);
            }
          }

          remL = rem.length;
        } else if (cmp === 0) {
          k++;
          rem = [0];
        }    // if cmp === 1, k will be 0

        // Add the next digit, k, to the result array.
        qd[i++] = k;

        // Update the remainder.
        if (cmp && rem[0]) {
          rem[remL++] = xd[xi] || 0;
        } else {
          rem = [xd[xi]];
          remL = 1;
        }

      } while ((xi++ < xL || rem[0] !== void 0) && sd--);
    }

    // Leading zero?
    if (!qd[0]) qd.shift();

    q.e = e;

    return round(q, dp ? pr + getBase10Exponent(q) + 1 : pr);
  };
})();


/*
 * Return a new Decimal whose value is the natural exponential of `x` truncated to `sd`
 * significant digits.
 *
 * Taylor/Maclaurin series.
 *
 * exp(x) = x^0/0! + x^1/1! + x^2/2! + x^3/3! + ...
 *
 * Argument reduction:
 *   Repeat x = x / 32, k += 5, until |x| < 0.1
 *   exp(x) = exp(x / 2^k)^(2^k)
 *
 * Previously, the argument was initially reduced by
 * exp(x) = exp(r) * 10^k  where r = x - k * ln10, k = floor(x / ln10)
 * to first put r in the range [0, ln10], before dividing by 32 until |x| < 0.1, but this was
 * found to be slower than just dividing repeatedly by 32 as above.
 *
 * (Math object integer min/max: Math.exp(709) = 8.2e+307, Math.exp(-745) = 5e-324)
 *
 *  exp(x) is non-terminating for any finite, non-zero x.
 *
 */
function exp(x, sd) {
  var denominator, guard, pow, sum, t, wpr,
    i = 0,
    k = 0,
    Ctor = x.constructor,
    pr = Ctor.precision;

  if (getBase10Exponent(x) > 16) throw Error(exponentOutOfRange + getBase10Exponent(x));

  // exp(0) = 1
  if (!x.s) return new Ctor(ONE);

  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }

  t = new Ctor(0.03125);

  while (x.abs().gte(0.1)) {
    x = x.times(t);    // x = x / 2^5
    k += 5;
  }

  // Estimate the precision increase necessary to ensure the first 4 rounding digits are correct.
  guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
  wpr += guard;
  denominator = pow = sum = new Ctor(ONE);
  Ctor.precision = wpr;

  for (;;) {
    pow = round(pow.times(x), wpr);
    denominator = denominator.times(++i);
    t = sum.plus(divide(pow, denominator, wpr));

    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
      while (k--) sum = round(sum.times(sum), wpr);
      Ctor.precision = pr;
      return sd == null ? (external = true, round(sum, pr)) : sum;
    }

    sum = t;
  }
}


// Calculate the base 10 exponent from the base 1e7 exponent.
function getBase10Exponent(x) {
  var e = x.e * LOG_BASE,
    w = x.d[0];

  // Add the number of digits of the first word of the digits array.
  for (; w >= 10; w /= 10) e++;
  return e;
}


function getLn10(Ctor, sd, pr) {

  if (sd > Ctor.LN10.sd()) {


    // Reset global state in case the exception is caught.
    external = true;
    if (pr) Ctor.precision = pr;
    throw Error(decimalError + 'LN10 precision limit exceeded');
  }

  return round(new Ctor(Ctor.LN10), sd);
}


function getZeroString(k) {
  var zs = '';
  for (; k--;) zs += '0';
  return zs;
}


/*
 * Return a new Decimal whose value is the natural logarithm of `x` truncated to `sd` significant
 * digits.
 *
 *  ln(n) is non-terminating (n != 1)
 *
 */
function ln(y, sd) {
  var c, c0, denominator, e, numerator, sum, t, wpr, x2,
    n = 1,
    guard = 10,
    x = y,
    xd = x.d,
    Ctor = x.constructor,
    pr = Ctor.precision;

  // ln(-x) = NaN
  // ln(0) = -Infinity
  if (x.s < 1) throw Error(decimalError + (x.s ? 'NaN' : '-Infinity'));

  // ln(1) = 0
  if (x.eq(ONE)) return new Ctor(0);

  if (sd == null) {
    external = false;
    wpr = pr;
  } else {
    wpr = sd;
  }

  if (x.eq(10)) {
    if (sd == null) external = true;
    return getLn10(Ctor, wpr);
  }

  wpr += guard;
  Ctor.precision = wpr;
  c = digitsToString(xd);
  c0 = c.charAt(0);
  e = getBase10Exponent(x);

  if (Math.abs(e) < 1.5e15) {

    // Argument reduction.
    // The series converges faster the closer the argument is to 1, so using
    // ln(a^b) = b * ln(a),   ln(a) = ln(a^b) / b
    // multiply the argument by itself until the leading digits of the significand are 7, 8, 9,
    // 10, 11, 12 or 13, recording the number of multiplications so the sum of the series can
    // later be divided by this number, then separate out the power of 10 using
    // ln(a*10^b) = ln(a) + b*ln(10).

    // max n is 21 (gives 0.9, 1.0 or 1.1) (9e15 / 21 = 4.2e14).
    //while (c0 < 9 && c0 != 1 || c0 == 1 && c.charAt(1) > 1) {
    // max n is 6 (gives 0.7 - 1.3)
    while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
      x = x.times(y);
      c = digitsToString(x.d);
      c0 = c.charAt(0);
      n++;
    }

    e = getBase10Exponent(x);

    if (c0 > 1) {
      x = new Ctor('0.' + c);
      e++;
    } else {
      x = new Ctor(c0 + '.' + c.slice(1));
    }
  } else {

    // The argument reduction method above may result in overflow if the argument y is a massive
    // number with exponent >= 1500000000000000 (9e15 / 6 = 1.5e15), so instead recall this
    // function using ln(x*10^e) = ln(x) + e*ln(10).
    t = getLn10(Ctor, wpr + 2, pr).times(e + '');
    x = ln(new Ctor(c0 + '.' + c.slice(1)), wpr - guard).plus(t);

    Ctor.precision = pr;
    return sd == null ? (external = true, round(x, pr)) : x;
  }

  // x is reduced to a value near 1.

  // Taylor series.
  // ln(y) = ln((1 + x)/(1 - x)) = 2(x + x^3/3 + x^5/5 + x^7/7 + ...)
  // where x = (y - 1)/(y + 1)    (|x| < 1)
  sum = numerator = x = divide(x.minus(ONE), x.plus(ONE), wpr);
  x2 = round(x.times(x), wpr);
  denominator = 3;

  for (;;) {
    numerator = round(numerator.times(x2), wpr);
    t = sum.plus(divide(numerator, new Ctor(denominator), wpr));

    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
      sum = sum.times(2);

      // Reverse the argument reduction.
      if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ''));
      sum = divide(sum, new Ctor(n), wpr);

      Ctor.precision = pr;
      return sd == null ? (external = true, round(sum, pr)) : sum;
    }

    sum = t;
    denominator += 2;
  }
}


/*
 * Parse the value of a new Decimal `x` from string `str`.
 */
function parseDecimal(x, str) {
  var e, i, len;

  // Decimal point?
  if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

  // Exponential form?
  if ((i = str.search(/e/i)) > 0) {

    // Determine exponent.
    if (e < 0) e = i;
    e += +str.slice(i + 1);
    str = str.substring(0, i);
  } else if (e < 0) {

    // Integer.
    e = str.length;
  }

  // Determine leading zeros.
  for (i = 0; str.charCodeAt(i) === 48;) ++i;

  // Determine trailing zeros.
  for (len = str.length; str.charCodeAt(len - 1) === 48;) --len;
  str = str.slice(i, len);

  if (str) {
    len -= i;
    e = e - i - 1;
    x.e = mathfloor(e / LOG_BASE);
    x.d = [];

    // Transform base

    // e is the base 10 exponent.
    // i is where to slice str to get the first word of the digits array.
    i = (e + 1) % LOG_BASE;
    if (e < 0) i += LOG_BASE;

    if (i < len) {
      if (i) x.d.push(+str.slice(0, i));
      for (len -= LOG_BASE; i < len;) x.d.push(+str.slice(i, i += LOG_BASE));
      str = str.slice(i);
      i = LOG_BASE - str.length;
    } else {
      i -= len;
    }

    for (; i--;) str += '0';
    x.d.push(+str);

    if (external && (x.e > MAX_E || x.e < -MAX_E)) throw Error(exponentOutOfRange + e);
  } else {

    // Zero.
    x.s = 0;
    x.e = 0;
    x.d = [0];
  }

  return x;
}


/*
 * Round `x` to `sd` significant digits, using rounding mode `rm` if present (truncate otherwise).
 */
 function round(x, sd, rm) {
  var i, j, k, n, rd, doRound, w, xdi,
    xd = x.d;

  // rd: the rounding digit, i.e. the digit after the digit that may be rounded up.
  // w: the word of xd which contains the rounding digit, a base 1e7 number.
  // xdi: the index of w within xd.
  // n: the number of digits of w.
  // i: what would be the index of rd within w if all the numbers were 7 digits long (i.e. if
  // they had leading zeros)
  // j: if > 0, the actual index of rd within w (if < 0, rd is a leading zero).

  // Get the length of the first word of the digits array xd.
  for (n = 1, k = xd[0]; k >= 10; k /= 10) n++;
  i = sd - n;

  // Is the rounding digit in the first word of xd?
  if (i < 0) {
    i += LOG_BASE;
    j = sd;
    w = xd[xdi = 0];
  } else {
    xdi = Math.ceil((i + 1) / LOG_BASE);
    k = xd.length;
    if (xdi >= k) return x;
    w = k = xd[xdi];

    // Get the number of digits of w.
    for (n = 1; k >= 10; k /= 10) n++;

    // Get the index of rd within w.
    i %= LOG_BASE;

    // Get the index of rd within w, adjusted for leading zeros.
    // The number of leading zeros of w is given by LOG_BASE - n.
    j = i - LOG_BASE + n;
  }

  if (rm !== void 0) {
    k = mathpow(10, n - j - 1);

    // Get the rounding digit at index j of w.
    rd = w / k % 10 | 0;

    // Are there any non-zero digits after the rounding digit?
    doRound = sd < 0 || xd[xdi + 1] !== void 0 || w % k;

    // The expression `w % mathpow(10, n - j - 1)` returns all the digits of w to the right of the
    // digit at (left-to-right) index j, e.g. if w is 908714 and j is 2, the expression will give
    // 714.

    doRound = rm < 4
      ? (rd || doRound) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
      : rd > 5 || rd == 5 && (rm == 4 || doRound || rm == 6 &&

        // Check whether the digit to the left of the rounding digit is odd.
        ((i > 0 ? j > 0 ? w / mathpow(10, n - j) : 0 : xd[xdi - 1]) % 10) & 1 ||
          rm == (x.s < 0 ? 8 : 7));
  }

  if (sd < 1 || !xd[0]) {
    if (doRound) {
      k = getBase10Exponent(x);
      xd.length = 1;

      // Convert sd to decimal places.
      sd = sd - k - 1;

      // 1, 0.1, 0.01, 0.001, 0.0001 etc.
      xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
      x.e = mathfloor(-sd / LOG_BASE) || 0;
    } else {
      xd.length = 1;

      // Zero.
      xd[0] = x.e = x.s = 0;
    }

    return x;
  }

  // Remove excess digits.
  if (i == 0) {
    xd.length = xdi;
    k = 1;
    xdi--;
  } else {
    xd.length = xdi + 1;
    k = mathpow(10, LOG_BASE - i);

    // E.g. 56700 becomes 56000 if 7 is the rounding digit.
    // j > 0 means i > number of leading zeros of w.
    xd[xdi] = j > 0 ? (w / mathpow(10, n - j) % mathpow(10, j) | 0) * k : 0;
  }

  if (doRound) {
    for (;;) {

      // Is the digit to be rounded up in the first word of xd?
      if (xdi == 0) {
        if ((xd[0] += k) == BASE) {
          xd[0] = 1;
          ++x.e;
        }

        break;
      } else {
        xd[xdi] += k;
        if (xd[xdi] != BASE) break;
        xd[xdi--] = 0;
        k = 1;
      }
    }
  }

  // Remove trailing zeros.
  for (i = xd.length; xd[--i] === 0;) xd.pop();

  if (external && (x.e > MAX_E || x.e < -MAX_E)) {
    throw Error(exponentOutOfRange + getBase10Exponent(x));
  }

  return x;
}


function subtract(x, y) {
  var d, e, i, j, k, len, xd, xe, xLTy, yd,
    Ctor = x.constructor,
    pr = Ctor.precision;

  // Return y negated if x is zero.
  // Return x if y is zero and x is non-zero.
  if (!x.s || !y.s) {
    if (y.s) y.s = -y.s;
    else y = new Ctor(x);
    return external ? round(y, pr) : y;
  }

  xd = x.d;
  yd = y.d;

  // x and y are non-zero numbers with the same sign.

  e = y.e;
  xe = x.e;
  xd = xd.slice();
  k = xe - e;

  // If exponents differ...
  if (k) {
    xLTy = k < 0;

    if (xLTy) {
      d = xd;
      k = -k;
      len = yd.length;
    } else {
      d = yd;
      e = xe;
      len = xd.length;
    }

    // Numbers with massively different exponents would result in a very high number of zeros
    // needing to be prepended, but this can be avoided while still ensuring correct rounding by
    // limiting the number of zeros to `Math.ceil(pr / LOG_BASE) + 2`.
    i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;

    if (k > i) {
      k = i;
      d.length = 1;
    }

    // Prepend zeros to equalise exponents.
    d.reverse();
    for (i = k; i--;) d.push(0);
    d.reverse();

  // Base 1e7 exponents equal.
  } else {

    // Check digits to determine which is the bigger number.

    i = xd.length;
    len = yd.length;
    xLTy = i < len;
    if (xLTy) len = i;

    for (i = 0; i < len; i++) {
      if (xd[i] != yd[i]) {
        xLTy = xd[i] < yd[i];
        break;
      }
    }

    k = 0;
  }

  if (xLTy) {
    d = xd;
    xd = yd;
    yd = d;
    y.s = -y.s;
  }

  len = xd.length;

  // Append zeros to xd if shorter.
  // Don't add zeros to yd if shorter as subtraction only needs to start at yd length.
  for (i = yd.length - len; i > 0; --i) xd[len++] = 0;

  // Subtract yd from xd.
  for (i = yd.length; i > k;) {
    if (xd[--i] < yd[i]) {
      for (j = i; j && xd[--j] === 0;) xd[j] = BASE - 1;
      --xd[j];
      xd[i] += BASE;
    }

    xd[i] -= yd[i];
  }

  // Remove trailing zeros.
  for (; xd[--len] === 0;) xd.pop();

  // Remove leading zeros and adjust exponent accordingly.
  for (; xd[0] === 0; xd.shift()) --e;

  // Zero?
  if (!xd[0]) return new Ctor(0);

  y.d = xd;
  y.e = e;

  //return external && xd.length >= pr / LOG_BASE ? round(y, pr) : y;
  return external ? round(y, pr) : y;
}


function toString(x, isExp, sd) {
  var k,
    e = getBase10Exponent(x),
    str = digitsToString(x.d),
    len = str.length;

  if (isExp) {
    if (sd && (k = sd - len) > 0) {
      str = str.charAt(0) + '.' + str.slice(1) + getZeroString(k);
    } else if (len > 1) {
      str = str.charAt(0) + '.' + str.slice(1);
    }

    str = str + (e < 0 ? 'e' : 'e+') + e;
  } else if (e < 0) {
    str = '0.' + getZeroString(-e - 1) + str;
    if (sd && (k = sd - len) > 0) str += getZeroString(k);
  } else if (e >= len) {
    str += getZeroString(e + 1 - len);
    if (sd && (k = sd - e - 1) > 0) str = str + '.' + getZeroString(k);
  } else {
    if ((k = e + 1) < len) str = str.slice(0, k) + '.' + str.slice(k);
    if (sd && (k = sd - len) > 0) {
      if (e + 1 === len) str += '.';
      str += getZeroString(k);
    }
  }

  return x.s < 0 ? '-' + str : str;
}


// Does not strip trailing zeros.
function truncate(arr, len) {
  if (arr.length > len) {
    arr.length = len;
    return true;
  }
}


// Decimal methods


/*
 *  clone
 *  config/set
 */


/*
 * Create and return a Decimal constructor with the same configuration properties as this Decimal
 * constructor.
 *
 */
function clone(obj) {
  var i, p, ps;

  /*
   * The Decimal constructor and exported function.
   * Return a new Decimal instance.
   *
   * value {number|string|Decimal} A numeric value.
   *
   */
  function Decimal(value) {
    var x = this;

    // Decimal called without new.
    if (!(x instanceof Decimal)) return new Decimal(value);

    // Retain a reference to this Decimal constructor, and shadow Decimal.prototype.constructor
    // which points to Object.
    x.constructor = Decimal;

    // Duplicate.
    if (value instanceof Decimal) {
      x.s = value.s;
      x.e = value.e;
      x.d = (value = value.d) ? value.slice() : value;
      return;
    }

    if (typeof value === 'number') {

      // Reject Infinity/NaN.
      if (value * 0 !== 0) {
        throw Error(invalidArgument + value);
      }

      if (value > 0) {
        x.s = 1;
      } else if (value < 0) {
        value = -value;
        x.s = -1;
      } else {
        x.s = 0;
        x.e = 0;
        x.d = [0];
        return;
      }

      // Fast path for small integers.
      if (value === ~~value && value < 1e7) {
        x.e = 0;
        x.d = [value];
        return;
      }

      return parseDecimal(x, value.toString());
    } else if (typeof value !== 'string') {
      throw Error(invalidArgument + value);
    }

    // Minus sign?
    if (value.charCodeAt(0) === 45) {
      value = value.slice(1);
      x.s = -1;
    } else {
      x.s = 1;
    }

    if (isDecimal.test(value)) parseDecimal(x, value);
    else throw Error(invalidArgument + value);
  }

  Decimal.prototype = P;

  Decimal.ROUND_UP = 0;
  Decimal.ROUND_DOWN = 1;
  Decimal.ROUND_CEIL = 2;
  Decimal.ROUND_FLOOR = 3;
  Decimal.ROUND_HALF_UP = 4;
  Decimal.ROUND_HALF_DOWN = 5;
  Decimal.ROUND_HALF_EVEN = 6;
  Decimal.ROUND_HALF_CEIL = 7;
  Decimal.ROUND_HALF_FLOOR = 8;

  Decimal.clone = clone;
  Decimal.config = Decimal.set = config;

  if (obj === void 0) obj = {};
  if (obj) {
    ps = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'LN10'];
    for (i = 0; i < ps.length;) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
  }

  Decimal.config(obj);

  return Decimal;
}


/*
 * Configure global settings for a Decimal constructor.
 *
 * `obj` is an object with one or more of the following properties,
 *
 *   precision  {number}
 *   rounding   {number}
 *   toExpNeg   {number}
 *   toExpPos   {number}
 *
 * E.g. Decimal.config({ precision: 20, rounding: 4 })
 *
 */
function config(obj) {
  if (!obj || typeof obj !== 'object') {
    throw Error(decimalError + 'Object expected');
  }
  var i, p, v,
    ps = [
      'precision', 1, MAX_DIGITS,
      'rounding', 0, 8,
      'toExpNeg', -1 / 0, 0,
      'toExpPos', 0, 1 / 0
    ];

  for (i = 0; i < ps.length; i += 3) {
    if ((v = obj[p = ps[i]]) !== void 0) {
      if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
      else throw Error(invalidArgument + p + ': ' + v);
    }
  }

  if ((v = obj[p = 'LN10']) !== void 0) {
      if (v == Math.LN10) this[p] = new this(v);
      else throw Error(invalidArgument + p + ': ' + v);
  }

  return this;
}


// Create and configure initial Decimal constructor.
export var Decimal = clone(defaults);

// Internal constant.
ONE = new Decimal(1);

export default Decimal;
