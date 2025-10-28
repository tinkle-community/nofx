"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _formatDecimal = require("./formatDecimal.js");

function _default(x) {
  return x = (0, _formatDecimal.formatDecimalParts)(Math.abs(x)), x ? x[1] : NaN;
}