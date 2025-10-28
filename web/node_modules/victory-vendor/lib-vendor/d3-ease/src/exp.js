"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expIn = expIn;
exports.expInOut = expInOut;
exports.expOut = expOut;

var _math = require("./math.js");

function expIn(t) {
  return (0, _math.tpmt)(1 - +t);
}

function expOut(t) {
  return 1 - (0, _math.tpmt)(t);
}

function expInOut(t) {
  return ((t *= 2) <= 1 ? (0, _math.tpmt)(1 - t) : 2 - (0, _math.tpmt)(t - 1)) / 2;
}