"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.abs = void 0;
exports.acos = acos;
exports.asin = asin;
exports.tau = exports.sqrt = exports.sin = exports.pi = exports.min = exports.max = exports.halfPi = exports.epsilon = exports.cos = exports.atan2 = void 0;
const abs = Math.abs;
exports.abs = abs;
const atan2 = Math.atan2;
exports.atan2 = atan2;
const cos = Math.cos;
exports.cos = cos;
const max = Math.max;
exports.max = max;
const min = Math.min;
exports.min = min;
const sin = Math.sin;
exports.sin = sin;
const sqrt = Math.sqrt;
exports.sqrt = sqrt;
const epsilon = 1e-12;
exports.epsilon = epsilon;
const pi = Math.PI;
exports.pi = pi;
const halfPi = pi / 2;
exports.halfPi = halfPi;
const tau = 2 * pi;
exports.tau = tau;

function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}

function asin(x) {
  return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
}