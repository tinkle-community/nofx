"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = nice;

var _ticks = require("./ticks.js");

function nice(start, stop, count) {
  let prestep;

  while (true) {
    const step = (0, _ticks.tickIncrement)(start, stop, count);

    if (step === prestep || step === 0 || !isFinite(step)) {
      return [start, stop];
    } else if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
    } else if (step < 0) {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
    }

    prestep = step;
  }
}