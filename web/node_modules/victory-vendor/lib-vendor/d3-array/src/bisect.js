"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.bisectRight = exports.bisectLeft = exports.bisectCenter = void 0;

var _ascending = _interopRequireDefault(require("./ascending.js"));

var _bisector = _interopRequireDefault(require("./bisector.js"));

var _number = _interopRequireDefault(require("./number.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ascendingBisect = (0, _bisector.default)(_ascending.default);
const bisectRight = ascendingBisect.right;
exports.bisectRight = bisectRight;
const bisectLeft = ascendingBisect.left;
exports.bisectLeft = bisectLeft;
const bisectCenter = (0, _bisector.default)(_number.default).center;
exports.bisectCenter = bisectCenter;
var _default = bisectRight;
exports.default = _default;