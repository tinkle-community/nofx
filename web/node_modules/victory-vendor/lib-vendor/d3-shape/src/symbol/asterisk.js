"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _math = require("../math.js");

const sqrt3 = (0, _math.sqrt)(3);
var _default = {
  draw(context, size) {
    const r = (0, _math.sqrt)(size + (0, _math.min)(size / 28, 0.75)) * 0.59436;
    const t = r / 2;
    const u = t * sqrt3;
    context.moveTo(0, r);
    context.lineTo(0, -r);
    context.moveTo(-u, -t);
    context.lineTo(u, t);
    context.moveTo(-u, t);
    context.lineTo(u, -t);
  }

};
exports.default = _default;