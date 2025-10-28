"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = subset;

var _superset = _interopRequireDefault(require("./superset.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function subset(values, other) {
  return (0, _superset.default)(other, values);
}