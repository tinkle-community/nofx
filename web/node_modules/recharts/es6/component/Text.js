var _excluded = ["x", "y", "lineHeight", "capHeight", "scaleToFit", "textAnchor", "verticalAnchor", "fill"],
  _excluded2 = ["dx", "dy", "angle", "className", "breakAll"];
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
import React, { useMemo } from 'react';
import isNil from 'lodash/isNil';
import clsx from 'clsx';
import { isNumber, isNumOrStr } from '../util/DataUtils';
import { Global } from '../util/Global';
import { filterProps } from '../util/ReactUtils';
import { getStringSize } from '../util/DOMUtils';
import { reduceCSSCalc } from '../util/ReduceCSSCalc';
var BREAKING_SPACES = /[ \f\n\r\t\v\u2028\u2029]+/;
var calculateWordWidths = function calculateWordWidths(_ref) {
  var children = _ref.children,
    breakAll = _ref.breakAll,
    style = _ref.style;
  try {
    var words = [];
    if (!isNil(children)) {
      if (breakAll) {
        words = children.toString().split('');
      } else {
        words = children.toString().split(BREAKING_SPACES);
      }
    }
    var wordsWithComputedWidth = words.map(function (word) {
      return {
        word: word,
        width: getStringSize(word, style).width
      };
    });
    var spaceWidth = breakAll ? 0 : getStringSize("\xA0", style).width;
    return {
      wordsWithComputedWidth: wordsWithComputedWidth,
      spaceWidth: spaceWidth
    };
  } catch (e) {
    return null;
  }
};
var calculateWordsByLines = function calculateWordsByLines(_ref2, initialWordsWithComputedWith, spaceWidth, lineWidth, scaleToFit) {
  var maxLines = _ref2.maxLines,
    children = _ref2.children,
    style = _ref2.style,
    breakAll = _ref2.breakAll;
  var shouldLimitLines = isNumber(maxLines);
  var text = children;
  var calculate = function calculate() {
    var words = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return words.reduce(function (result, _ref3) {
      var word = _ref3.word,
        width = _ref3.width;
      var currentLine = result[result.length - 1];
      if (currentLine && (lineWidth == null || scaleToFit || currentLine.width + width + spaceWidth < Number(lineWidth))) {
        // Word can be added to an existing line
        currentLine.words.push(word);
        currentLine.width += width + spaceWidth;
      } else {
        // Add first word to line or word is too long to scaleToFit on existing line
        var newLine = {
          words: [word],
          width: width
        };
        result.push(newLine);
      }
      return result;
    }, []);
  };
  var originalResult = calculate(initialWordsWithComputedWith);
  var findLongestLine = function findLongestLine(words) {
    return words.reduce(function (a, b) {
      return a.width > b.width ? a : b;
    });
  };
  if (!shouldLimitLines) {
    return originalResult;
  }
  var suffix = '…';
  var checkOverflow = function checkOverflow(index) {
    var tempText = text.slice(0, index);
    var words = calculateWordWidths({
      breakAll: breakAll,
      style: style,
      children: tempText + suffix
    }).wordsWithComputedWidth;
    var result = calculate(words);
    var doesOverflow = result.length > maxLines || findLongestLine(result).width > Number(lineWidth);
    return [doesOverflow, result];
  };
  var start = 0;
  var end = text.length - 1;
  var iterations = 0;
  var trimmedResult;
  while (start <= end && iterations <= text.length - 1) {
    var middle = Math.floor((start + end) / 2);
    var prev = middle - 1;
    var _checkOverflow = checkOverflow(prev),
      _checkOverflow2 = _slicedToArray(_checkOverflow, 2),
      doesPrevOverflow = _checkOverflow2[0],
      result = _checkOverflow2[1];
    var _checkOverflow3 = checkOverflow(middle),
      _checkOverflow4 = _slicedToArray(_checkOverflow3, 1),
      doesMiddleOverflow = _checkOverflow4[0];
    if (!doesPrevOverflow && !doesMiddleOverflow) {
      start = middle + 1;
    }
    if (doesPrevOverflow && doesMiddleOverflow) {
      end = middle - 1;
    }
    if (!doesPrevOverflow && doesMiddleOverflow) {
      trimmedResult = result;
      break;
    }
    iterations++;
  }

  // Fallback to originalResult (result without trimming) if we cannot find the
  // where to trim.  This should not happen :tm:
  return trimmedResult || originalResult;
};
var getWordsWithoutCalculate = function getWordsWithoutCalculate(children) {
  var words = !isNil(children) ? children.toString().split(BREAKING_SPACES) : [];
  return [{
    words: words
  }];
};
var getWordsByLines = function getWordsByLines(_ref4) {
  var width = _ref4.width,
    scaleToFit = _ref4.scaleToFit,
    children = _ref4.children,
    style = _ref4.style,
    breakAll = _ref4.breakAll,
    maxLines = _ref4.maxLines;
  // Only perform calculations if using features that require them (multiline, scaleToFit)
  if ((width || scaleToFit) && !Global.isSsr) {
    var wordsWithComputedWidth, spaceWidth;
    var wordWidths = calculateWordWidths({
      breakAll: breakAll,
      children: children,
      style: style
    });
    if (wordWidths) {
      var wcw = wordWidths.wordsWithComputedWidth,
        sw = wordWidths.spaceWidth;
      wordsWithComputedWidth = wcw;
      spaceWidth = sw;
    } else {
      return getWordsWithoutCalculate(children);
    }
    return calculateWordsByLines({
      breakAll: breakAll,
      children: children,
      maxLines: maxLines,
      style: style
    }, wordsWithComputedWidth, spaceWidth, width, scaleToFit);
  }
  return getWordsWithoutCalculate(children);
};
var DEFAULT_FILL = '#808080';
export var Text = function Text(_ref5) {
  var _ref5$x = _ref5.x,
    propsX = _ref5$x === void 0 ? 0 : _ref5$x,
    _ref5$y = _ref5.y,
    propsY = _ref5$y === void 0 ? 0 : _ref5$y,
    _ref5$lineHeight = _ref5.lineHeight,
    lineHeight = _ref5$lineHeight === void 0 ? '1em' : _ref5$lineHeight,
    _ref5$capHeight = _ref5.capHeight,
    capHeight = _ref5$capHeight === void 0 ? '0.71em' : _ref5$capHeight,
    _ref5$scaleToFit = _ref5.scaleToFit,
    scaleToFit = _ref5$scaleToFit === void 0 ? false : _ref5$scaleToFit,
    _ref5$textAnchor = _ref5.textAnchor,
    textAnchor = _ref5$textAnchor === void 0 ? 'start' : _ref5$textAnchor,
    _ref5$verticalAnchor = _ref5.verticalAnchor,
    verticalAnchor = _ref5$verticalAnchor === void 0 ? 'end' : _ref5$verticalAnchor,
    _ref5$fill = _ref5.fill,
    fill = _ref5$fill === void 0 ? DEFAULT_FILL : _ref5$fill,
    props = _objectWithoutProperties(_ref5, _excluded);
  var wordsByLines = useMemo(function () {
    return getWordsByLines({
      breakAll: props.breakAll,
      children: props.children,
      maxLines: props.maxLines,
      scaleToFit: scaleToFit,
      style: props.style,
      width: props.width
    });
  }, [props.breakAll, props.children, props.maxLines, scaleToFit, props.style, props.width]);
  var dx = props.dx,
    dy = props.dy,
    angle = props.angle,
    className = props.className,
    breakAll = props.breakAll,
    textProps = _objectWithoutProperties(props, _excluded2);
  if (!isNumOrStr(propsX) || !isNumOrStr(propsY)) {
    return null;
  }
  var x = propsX + (isNumber(dx) ? dx : 0);
  var y = propsY + (isNumber(dy) ? dy : 0);
  var startDy;
  switch (verticalAnchor) {
    case 'start':
      startDy = reduceCSSCalc("calc(".concat(capHeight, ")"));
      break;
    case 'middle':
      startDy = reduceCSSCalc("calc(".concat((wordsByLines.length - 1) / 2, " * -").concat(lineHeight, " + (").concat(capHeight, " / 2))"));
      break;
    default:
      startDy = reduceCSSCalc("calc(".concat(wordsByLines.length - 1, " * -").concat(lineHeight, ")"));
      break;
  }
  var transforms = [];
  if (scaleToFit) {
    var lineWidth = wordsByLines[0].width;
    var width = props.width;
    transforms.push("scale(".concat((isNumber(width) ? width / lineWidth : 1) / lineWidth, ")"));
  }
  if (angle) {
    transforms.push("rotate(".concat(angle, ", ").concat(x, ", ").concat(y, ")"));
  }
  if (transforms.length) {
    textProps.transform = transforms.join(' ');
  }
  return /*#__PURE__*/React.createElement("text", _extends({}, filterProps(textProps, true), {
    x: x,
    y: y,
    className: clsx('recharts-text', className),
    textAnchor: textAnchor,
    fill: fill.includes('url') ? DEFAULT_FILL : fill
  }), wordsByLines.map(function (line, index) {
    var words = line.words.join(breakAll ? '' : ' ');
    return (
      /*#__PURE__*/
      // duplicate words will cause duplicate keys
      // eslint-disable-next-line react/no-array-index-key
      React.createElement("tspan", {
        x: x,
        dy: index === 0 ? startDy : lineHeight,
        key: "".concat(words, "-").concat(index)
      }, words)
    );
  }));
};