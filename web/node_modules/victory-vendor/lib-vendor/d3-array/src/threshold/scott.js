"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = thresholdScott;

var _count = _interopRequireDefault(require("../count.js"));

var _deviation = _interopRequireDefault(require("../deviation.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function thresholdScott(values, min, max) {
  return Math.ceil((max - min) * Math.cbrt((0, _count.default)(values)) / (3.49 * (0, _deviation.default)(values)));
}