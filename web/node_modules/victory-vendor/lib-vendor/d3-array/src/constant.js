"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = constant;

function constant(x) {
  return () => x;
}