"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = reverse;

function reverse(values) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  return Array.from(values).reverse();
}