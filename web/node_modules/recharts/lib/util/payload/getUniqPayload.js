"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUniqPayload = getUniqPayload;
var _uniqBy = _interopRequireDefault(require("lodash/uniqBy"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
/**
 * This is configuration option that decides how to filter for unique values only:
 *
 * - `false` means "no filter"
 * - `true` means "use recharts default filter"
 * - function means "use return of this function as the default key"
 */

function getUniqPayload(payload, option, defaultUniqBy) {
  if (option === true) {
    return (0, _uniqBy["default"])(payload, defaultUniqBy);
  }
  if ((0, _isFunction["default"])(option)) {
    return (0, _uniqBy["default"])(payload, option);
  }
  return payload;
}