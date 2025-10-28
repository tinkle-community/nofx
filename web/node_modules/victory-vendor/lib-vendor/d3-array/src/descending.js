"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = descending;

function descending(a, b) {
  return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}