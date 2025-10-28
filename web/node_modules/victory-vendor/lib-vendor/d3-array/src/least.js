"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = least;

var _ascending = _interopRequireDefault(require("./ascending.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function least(values, compare = _ascending.default) {
  let min;
  let defined = false;

  if (compare.length === 1) {
    let minValue;

    for (const element of values) {
      const value = compare(element);

      if (defined ? (0, _ascending.default)(value, minValue) < 0 : (0, _ascending.default)(value, value) === 0) {
        min = element;
        minValue = value;
        defined = true;
      }
    }
  } else {
    for (const value of values) {
      if (defined ? compare(value, min) < 0 : compare(value, value) === 0) {
        min = value;
        defined = true;
      }
    }
  }

  return min;
}