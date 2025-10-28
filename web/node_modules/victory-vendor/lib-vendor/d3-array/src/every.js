"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = every;

function every(values, test) {
  if (typeof test !== "function") throw new TypeError("test is not a function");
  let index = -1;

  for (const value of values) {
    if (!test(value, ++index, values)) {
      return false;
    }
  }

  return true;
}