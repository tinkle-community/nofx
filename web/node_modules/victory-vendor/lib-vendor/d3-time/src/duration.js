"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.durationYear = exports.durationWeek = exports.durationSecond = exports.durationMonth = exports.durationMinute = exports.durationHour = exports.durationDay = void 0;
const durationSecond = 1000;
exports.durationSecond = durationSecond;
const durationMinute = durationSecond * 60;
exports.durationMinute = durationMinute;
const durationHour = durationMinute * 60;
exports.durationHour = durationHour;
const durationDay = durationHour * 24;
exports.durationDay = durationDay;
const durationWeek = durationDay * 7;
exports.durationWeek = durationWeek;
const durationMonth = durationDay * 30;
exports.durationMonth = durationMonth;
const durationYear = durationDay * 365;
exports.durationYear = durationYear;