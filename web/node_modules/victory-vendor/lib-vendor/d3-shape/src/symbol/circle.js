"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _math = require("../math.js");

var _default = {
  draw(context, size) {
    const r = (0, _math.sqrt)(size / _math.pi);
    context.moveTo(r, 0);
    context.arc(0, 0, r, 0, _math.tau);
  }

};
exports.default = _default;