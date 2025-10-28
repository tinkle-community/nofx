"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utcMinutes = exports.default = void 0;

var _interval = _interopRequireDefault(require("./interval.js"));

var _duration = require("./duration.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var utcMinute = (0, _interval.default)(function (date) {
  date.setUTCSeconds(0, 0);
}, function (date, step) {
  date.setTime(+date + step * _duration.durationMinute);
}, function (start, end) {
  return (end - start) / _duration.durationMinute;
}, function (date) {
  return date.getUTCMinutes();
});
var _default = utcMinute;
exports.default = _default;
var utcMinutes = utcMinute.range;
exports.utcMinutes = utcMinutes;