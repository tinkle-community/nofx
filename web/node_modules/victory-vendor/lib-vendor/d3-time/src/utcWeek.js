"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utcWednesdays = exports.utcWednesday = exports.utcTuesdays = exports.utcTuesday = exports.utcThursdays = exports.utcThursday = exports.utcSundays = exports.utcSunday = exports.utcSaturdays = exports.utcSaturday = exports.utcMondays = exports.utcMonday = exports.utcFridays = exports.utcFriday = void 0;

var _interval = _interopRequireDefault(require("./interval.js"));

var _duration = require("./duration.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function utcWeekday(i) {
  return (0, _interval.default)(function (date) {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, function (date, step) {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, function (start, end) {
    return (end - start) / _duration.durationWeek;
  });
}

var utcSunday = utcWeekday(0);
exports.utcSunday = utcSunday;
var utcMonday = utcWeekday(1);
exports.utcMonday = utcMonday;
var utcTuesday = utcWeekday(2);
exports.utcTuesday = utcTuesday;
var utcWednesday = utcWeekday(3);
exports.utcWednesday = utcWednesday;
var utcThursday = utcWeekday(4);
exports.utcThursday = utcThursday;
var utcFriday = utcWeekday(5);
exports.utcFriday = utcFriday;
var utcSaturday = utcWeekday(6);
exports.utcSaturday = utcSaturday;
var utcSundays = utcSunday.range;
exports.utcSundays = utcSundays;
var utcMondays = utcMonday.range;
exports.utcMondays = utcMondays;
var utcTuesdays = utcTuesday.range;
exports.utcTuesdays = utcTuesdays;
var utcWednesdays = utcWednesday.range;
exports.utcWednesdays = utcWednesdays;
var utcThursdays = utcThursday.range;
exports.utcThursdays = utcThursdays;
var utcFridays = utcFriday.range;
exports.utcFridays = utcFridays;
var utcSaturdays = utcSaturday.range;
exports.utcSaturdays = utcSaturdays;