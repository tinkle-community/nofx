"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = zip;

var _transpose = _interopRequireDefault(require("./transpose.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function zip() {
  return (0, _transpose.default)(arguments);
}