"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = setRafTimeout;
function safeRequestAnimationFrame(callback) {
  if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(callback);
}
function setRafTimeout(callback) {
  var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var currTime = -1;
  var shouldUpdate = function shouldUpdate(now) {
    if (currTime < 0) {
      currTime = now;
    }
    if (now - currTime > timeout) {
      callback(now);
      currTime = -1;
    } else {
      safeRequestAnimationFrame(shouldUpdate);
    }
  };
  requestAnimationFrame(shouldUpdate);
}