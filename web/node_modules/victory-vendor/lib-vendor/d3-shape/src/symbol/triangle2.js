"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _math = require("../math.js");

const sqrt3 = (0, _math.sqrt)(3);
var _default = {
  draw(context, size) {
    const s = (0, _math.sqrt)(size) * 0.6824;
    const t = s / 2;
    const u = s * sqrt3 / 2; // cos(Math.PI / 6)

    context.moveTo(0, -s);
    context.lineTo(u, t);
    context.lineTo(-u, t);
    context.closePath();
  }

};
exports.default = _default;