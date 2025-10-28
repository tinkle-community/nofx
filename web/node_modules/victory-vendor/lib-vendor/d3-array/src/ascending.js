"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ascending;

function ascending(a, b) {
  return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}