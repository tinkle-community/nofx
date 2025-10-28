"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = thresholdSturges;

var _count = _interopRequireDefault(require("../count.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function thresholdSturges(values) {
  return Math.ceil(Math.log((0, _count.default)(values)) / Math.LN2) + 1;
}