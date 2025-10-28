"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = utcTime;

var _index = require("../../../lib-vendor/d3-time/src/index.js");

var _index2 = require("../../../lib-vendor/d3-time-format/src/index.js");

var _time = require("./time.js");

var _init = require("./init.js");

function utcTime() {
  return _init.initRange.apply((0, _time.calendar)(_index.utcTicks, _index.utcTickInterval, _index.utcYear, _index.utcMonth, _index.utcWeek, _index.utcDay, _index.utcHour, _index.utcMinute, _index.utcSecond, _index2.utcFormat).domain([Date.UTC(2000, 0, 1), Date.UTC(2000, 0, 2)]), arguments);
}