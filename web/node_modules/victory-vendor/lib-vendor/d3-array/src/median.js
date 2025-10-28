"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = median;

var _quantile = _interopRequireDefault(require("./quantile.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function median(values, valueof) {
  return (0, _quantile.default)(values, 0.5, valueof);
}