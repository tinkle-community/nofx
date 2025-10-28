"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _exponent = _interopRequireDefault(require("./exponent.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(step, max) {
  step = Math.abs(step), max = Math.abs(max) - step;
  return Math.max(0, (0, _exponent.default)(max) - (0, _exponent.default)(step)) + 1;
}