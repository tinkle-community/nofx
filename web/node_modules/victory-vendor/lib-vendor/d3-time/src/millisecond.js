"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.milliseconds = exports.default = void 0;

var _interval = _interopRequireDefault(require("./interval.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var millisecond = (0, _interval.default)(function () {// noop
}, function (date, step) {
  date.setTime(+date + step);
}, function (start, end) {
  return end - start;
}); // An optimized implementation for this simple case.

millisecond.every = function (k) {
  k = Math.floor(k);
  if (!isFinite(k) || !(k > 0)) return null;
  if (!(k > 1)) return millisecond;
  return (0, _interval.default)(function (date) {
    date.setTime(Math.floor(date / k) * k);
  }, function (date, step) {
    date.setTime(+date + step * k);
  }, function (start, end) {
    return (end - start) / k;
  });
};

var _default = millisecond;
exports.default = _default;
var milliseconds = millisecond.range;
exports.milliseconds = milliseconds;