"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = tickFormat;

var _index = require("../../../lib-vendor/d3-array/src/index.js");

var _index2 = require("../../../lib-vendor/d3-format/src/index.js");

function tickFormat(start, stop, count, specifier) {
  var step = (0, _index.tickStep)(start, stop, count),
      precision;
  specifier = (0, _index2.formatSpecifier)(specifier == null ? ",f" : specifier);

  switch (specifier.type) {
    case "s":
      {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN(precision = (0, _index2.precisionPrefix)(step, value))) specifier.precision = precision;
        return (0, _index2.formatPrefix)(specifier, value);
      }

    case "":
    case "e":
    case "g":
    case "p":
    case "r":
      {
        if (specifier.precision == null && !isNaN(precision = (0, _index2.precisionRound)(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
        break;
      }

    case "f":
    case "%":
      {
        if (specifier.precision == null && !isNaN(precision = (0, _index2.precisionFixed)(step))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
  }

  return (0, _index2.format)(specifier);
}