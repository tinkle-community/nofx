"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mode;

var _index = require("../../../lib-vendor/internmap/src/index.js");

function mode(values, valueof) {
  const counts = new _index.InternMap();

  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && value >= value) {
        counts.set(value, (counts.get(value) || 0) + 1);
      }
    }
  } else {
    let index = -1;

    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && value >= value) {
        counts.set(value, (counts.get(value) || 0) + 1);
      }
    }
  }

  let modeValue;
  let modeCount = 0;

  for (const [value, count] of counts) {
    if (count > modeCount) {
      modeCount = count;
      modeValue = value;
    }
  }

  return modeValue;
}