"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _math = require("../math.js");

const c = -0.5;
const s = (0, _math.sqrt)(3) / 2;
const k = 1 / (0, _math.sqrt)(12);
const a = (k / 2 + 1) * 3;
var _default = {
  draw(context, size) {
    const r = (0, _math.sqrt)(size / a);
    const x0 = r / 2,
          y0 = r * k;
    const x1 = x0,
          y1 = r * k + r;
    const x2 = -x1,
          y2 = y1;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(c * x0 - s * y0, s * x0 + c * y0);
    context.lineTo(c * x1 - s * y1, s * x1 + c * y1);
    context.lineTo(c * x2 - s * y2, s * x2 + c * y2);
    context.lineTo(c * x0 + s * y0, c * y0 - s * x0);
    context.lineTo(c * x1 + s * y1, c * y1 - s * x1);
    context.lineTo(c * x2 + s * y2, c * y2 - s * x2);
    context.closePath();
  }

};
exports.default = _default;