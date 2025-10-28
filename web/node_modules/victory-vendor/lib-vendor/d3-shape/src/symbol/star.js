"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _math = require("../math.js");

const ka = 0.89081309152928522810;
const kr = (0, _math.sin)(_math.pi / 10) / (0, _math.sin)(7 * _math.pi / 10);
const kx = (0, _math.sin)(_math.tau / 10) * kr;
const ky = -(0, _math.cos)(_math.tau / 10) * kr;
var _default = {
  draw(context, size) {
    const r = (0, _math.sqrt)(size * ka);
    const x = kx * r;
    const y = ky * r;
    context.moveTo(0, -r);
    context.lineTo(x, y);

    for (let i = 1; i < 5; ++i) {
      const a = _math.tau * i / 5;
      const c = (0, _math.cos)(a);
      const s = (0, _math.sin)(a);
      context.lineTo(s * r, -c * r);
      context.lineTo(c * x - s * y, s * x + c * y);
    }

    context.closePath();
  }

};
exports.default = _default;