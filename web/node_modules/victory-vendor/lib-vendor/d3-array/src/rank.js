"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = rank;

var _ascending = _interopRequireDefault(require("./ascending.js"));

var _sort = require("./sort.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function rank(values, valueof = _ascending.default) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  let V = Array.from(values);
  const R = new Float64Array(V.length);
  if (valueof.length !== 2) V = V.map(valueof), valueof = _ascending.default;

  const compareIndex = (i, j) => valueof(V[i], V[j]);

  let k, r;
  Uint32Array.from(V, (_, i) => i).sort(valueof === _ascending.default ? (i, j) => (0, _sort.ascendingDefined)(V[i], V[j]) : (0, _sort.compareDefined)(compareIndex)).forEach((j, i) => {
    const c = compareIndex(j, k === undefined ? j : k);

    if (c >= 0) {
      if (k === undefined || c > 0) k = j, r = i;
      R[j] = r;
    } else {
      R[j] = NaN;
    }
  });
  return R;
}