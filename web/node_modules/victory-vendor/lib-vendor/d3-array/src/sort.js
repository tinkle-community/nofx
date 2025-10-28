"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ascendingDefined = ascendingDefined;
exports.compareDefined = compareDefined;
exports.default = sort;

var _ascending = _interopRequireDefault(require("./ascending.js"));

var _permute = _interopRequireDefault(require("./permute.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sort(values, ...F) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  values = Array.from(values);
  let [f] = F;

  if (f && f.length !== 2 || F.length > 1) {
    const index = Uint32Array.from(values, (d, i) => i);

    if (F.length > 1) {
      F = F.map(f => values.map(f));
      index.sort((i, j) => {
        for (const f of F) {
          const c = ascendingDefined(f[i], f[j]);
          if (c) return c;
        }
      });
    } else {
      f = values.map(f);
      index.sort((i, j) => ascendingDefined(f[i], f[j]));
    }

    return (0, _permute.default)(values, index);
  }

  return values.sort(compareDefined(f));
}

function compareDefined(compare = _ascending.default) {
  if (compare === _ascending.default) return ascendingDefined;
  if (typeof compare !== "function") throw new TypeError("compare is not a function");
  return (a, b) => {
    const x = compare(a, b);
    if (x || x === 0) return x;
    return (compare(b, b) === 0) - (compare(a, a) === 0);
  };
}

function ascendingDefined(a, b) {
  return (a == null || !(a >= a)) - (b == null || !(b >= b)) || (a < b ? -1 : a > b ? 1 : 0);
}