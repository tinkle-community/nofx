"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.prefixExponent = void 0;

var _formatDecimal = require("./formatDecimal.js");

var prefixExponent;
exports.prefixExponent = prefixExponent;

function _default(x, p) {
  var d = (0, _formatDecimal.formatDecimalParts)(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1],
      i = exponent - (exports.prefixExponent = prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
      n = coefficient.length;
  return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + (0, _formatDecimal.formatDecimalParts)(x, Math.max(0, p + i - 1))[0]; // less than 1y!
}