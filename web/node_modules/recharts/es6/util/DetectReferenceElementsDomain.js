function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
import { ReferenceDot } from '../cartesian/ReferenceDot';
import { ReferenceLine } from '../cartesian/ReferenceLine';
import { ReferenceArea } from '../cartesian/ReferenceArea';
import { ifOverflowMatches } from './IfOverflowMatches';
import { findAllByType } from './ReactUtils';
import { isNumber } from './DataUtils';
export var detectReferenceElementsDomain = function detectReferenceElementsDomain(children, domain, axisId, axisType, specifiedTicks) {
  var lines = findAllByType(children, ReferenceLine);
  var dots = findAllByType(children, ReferenceDot);
  var elements = [].concat(_toConsumableArray(lines), _toConsumableArray(dots));
  var areas = findAllByType(children, ReferenceArea);
  var idKey = "".concat(axisType, "Id");
  var valueKey = axisType[0];
  var finalDomain = domain;
  if (elements.length) {
    finalDomain = elements.reduce(function (result, el) {
      if (el.props[idKey] === axisId && ifOverflowMatches(el.props, 'extendDomain') && isNumber(el.props[valueKey])) {
        var value = el.props[valueKey];
        return [Math.min(result[0], value), Math.max(result[1], value)];
      }
      return result;
    }, finalDomain);
  }
  if (areas.length) {
    var key1 = "".concat(valueKey, "1");
    var key2 = "".concat(valueKey, "2");
    finalDomain = areas.reduce(function (result, el) {
      if (el.props[idKey] === axisId && ifOverflowMatches(el.props, 'extendDomain') && isNumber(el.props[key1]) && isNumber(el.props[key2])) {
        var value1 = el.props[key1];
        var value2 = el.props[key2];
        return [Math.min(result[0], value1, value2), Math.max(result[1], value1, value2)];
      }
      return result;
    }, finalDomain);
  }
  if (specifiedTicks && specifiedTicks.length) {
    finalDomain = specifiedTicks.reduce(function (result, tick) {
      if (isNumber(tick)) {
        return [Math.min(result[0], tick), Math.max(result[1], tick)];
      }
      return result;
    }, finalDomain);
  }
  return finalDomain;
};