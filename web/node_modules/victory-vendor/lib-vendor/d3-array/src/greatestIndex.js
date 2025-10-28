"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = greatestIndex;

var _ascending = _interopRequireDefault(require("./ascending.js"));

var _maxIndex = _interopRequireDefault(require("./maxIndex.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function greatestIndex(values, compare = _ascending.default) {
  if (compare.length === 1) return (0, _maxIndex.default)(values, compare);
  let maxValue;
  let max = -1;
  let index = -1;

  for (const value of values) {
    ++index;

    if (max < 0 ? compare(value, value) === 0 : compare(value, maxValue) > 0) {
      maxValue = value;
      max = index;
    }
  }

  return max;
}