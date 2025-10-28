"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _timer = require("./timer.js");

function _default(callback, delay, time) {
  var t = new _timer.Timer(),
      total = delay;
  if (delay == null) return t.restart(callback, delay, time), t;
  t._restart = t.restart;

  t.restart = function (callback, delay, time) {
    delay = +delay, time = time == null ? (0, _timer.now)() : +time;

    t._restart(function tick(elapsed) {
      elapsed += total;

      t._restart(tick, total += delay, time);

      callback(elapsed);
    }, delay, time);
  };

  t.restart(callback, delay, time);
  return t;
}