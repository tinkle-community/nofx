"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = scan;

var _leastIndex = _interopRequireDefault(require("./leastIndex.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function scan(values, compare) {
  const index = (0, _leastIndex.default)(values, compare);
  return index < 0 ? undefined : index;
}