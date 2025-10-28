"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utcTicks = exports.utcTickInterval = exports.timeTicks = exports.timeTickInterval = void 0;

var _index = require("../../../lib-vendor/d3-array/src/index.js");

var _duration = require("./duration.js");

var _millisecond = _interopRequireDefault(require("./millisecond.js"));

var _second = _interopRequireDefault(require("./second.js"));

var _minute = _interopRequireDefault(require("./minute.js"));

var _hour = _interopRequireDefault(require("./hour.js"));

var _day = _interopRequireDefault(require("./day.js"));

var _week = require("./week.js");

var _month = _interopRequireDefault(require("./month.js"));

var _year = _interopRequireDefault(require("./year.js"));

var _utcMinute = _interopRequireDefault(require("./utcMinute.js"));

var _utcHour = _interopRequireDefault(require("./utcHour.js"));

var _utcDay = _interopRequireDefault(require("./utcDay.js"));

var _utcWeek = require("./utcWeek.js");

var _utcMonth = _interopRequireDefault(require("./utcMonth.js"));

var _utcYear = _interopRequireDefault(require("./utcYear.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ticker(year, month, week, day, hour, minute) {
  const tickIntervals = [[_second.default, 1, _duration.durationSecond], [_second.default, 5, 5 * _duration.durationSecond], [_second.default, 15, 15 * _duration.durationSecond], [_second.default, 30, 30 * _duration.durationSecond], [minute, 1, _duration.durationMinute], [minute, 5, 5 * _duration.durationMinute], [minute, 15, 15 * _duration.durationMinute], [minute, 30, 30 * _duration.durationMinute], [hour, 1, _duration.durationHour], [hour, 3, 3 * _duration.durationHour], [hour, 6, 6 * _duration.durationHour], [hour, 12, 12 * _duration.durationHour], [day, 1, _duration.durationDay], [day, 2, 2 * _duration.durationDay], [week, 1, _duration.durationWeek], [month, 1, _duration.durationMonth], [month, 3, 3 * _duration.durationMonth], [year, 1, _duration.durationYear]];

  function ticks(start, stop, count) {
    const reverse = stop < start;
    if (reverse) [start, stop] = [stop, start];
    const interval = count && typeof count.range === "function" ? count : tickInterval(start, stop, count);
    const ticks = interval ? interval.range(start, +stop + 1) : []; // inclusive stop

    return reverse ? ticks.reverse() : ticks;
  }

  function tickInterval(start, stop, count) {
    const target = Math.abs(stop - start) / count;
    const i = (0, _index.bisector)(([,, step]) => step).right(tickIntervals, target);
    if (i === tickIntervals.length) return year.every((0, _index.tickStep)(start / _duration.durationYear, stop / _duration.durationYear, count));
    if (i === 0) return _millisecond.default.every(Math.max((0, _index.tickStep)(start, stop, count), 1));
    const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
    return t.every(step);
  }

  return [ticks, tickInterval];
}

const [utcTicks, utcTickInterval] = ticker(_utcYear.default, _utcMonth.default, _utcWeek.utcSunday, _utcDay.default, _utcHour.default, _utcMinute.default);
exports.utcTickInterval = utcTickInterval;
exports.utcTicks = utcTicks;
const [timeTicks, timeTickInterval] = ticker(_year.default, _month.default, _week.sunday, _day.default, _hour.default, _minute.default);
exports.timeTickInterval = timeTickInterval;
exports.timeTicks = timeTicks;