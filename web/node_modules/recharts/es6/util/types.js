function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
import { isValidElement } from 'react';
import isObject from 'lodash/isObject';

/**
 * Determines how values are stacked:
 *
 * - `none` is the default, it adds values on top of each other. No smarts. Negative values will overlap.
 * - `expand` make it so that the values always add up to 1 - so the chart will look like a rectangle.
 * - `wiggle` and `silhouette` tries to keep the chart centered.
 * - `sign` stacks positive values above zero and negative values below zero. Similar to `none` but handles negatives.
 * - `positive` ignores all negative values, and then behaves like \`none\`.
 *
 * Also see https://d3js.org/d3-shape/stack#stack-offsets
 * (note that the `diverging` offset in d3 is named `sign` in recharts)
 */

//
// Event Handler Types -- Copied from @types/react/index.d.ts and adapted for Props.
//

var SVGContainerPropKeys = ['viewBox', 'children'];
export var SVGElementPropKeys = ['aria-activedescendant', 'aria-atomic', 'aria-autocomplete', 'aria-busy', 'aria-checked', 'aria-colcount', 'aria-colindex', 'aria-colspan', 'aria-controls', 'aria-current', 'aria-describedby', 'aria-details', 'aria-disabled', 'aria-errormessage', 'aria-expanded', 'aria-flowto', 'aria-haspopup', 'aria-hidden', 'aria-invalid', 'aria-keyshortcuts', 'aria-label', 'aria-labelledby', 'aria-level', 'aria-live', 'aria-modal', 'aria-multiline', 'aria-multiselectable', 'aria-orientation', 'aria-owns', 'aria-placeholder', 'aria-posinset', 'aria-pressed', 'aria-readonly', 'aria-relevant', 'aria-required', 'aria-roledescription', 'aria-rowcount', 'aria-rowindex', 'aria-rowspan', 'aria-selected', 'aria-setsize', 'aria-sort', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow', 'aria-valuetext', 'className', 'color', 'height', 'id', 'lang', 'max', 'media', 'method', 'min', 'name', 'style',
/*
 * removed 'type' SVGElementPropKey because we do not currently use any SVG elements
 * that can use it and it conflicts with the recharts prop 'type'
 * https://github.com/recharts/recharts/pull/3327
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/type
 */
// 'type',
'target', 'width', 'role', 'tabIndex', 'accentHeight', 'accumulate', 'additive', 'alignmentBaseline', 'allowReorder', 'alphabetic', 'amplitude', 'arabicForm', 'ascent', 'attributeName', 'attributeType', 'autoReverse', 'azimuth', 'baseFrequency', 'baselineShift', 'baseProfile', 'bbox', 'begin', 'bias', 'by', 'calcMode', 'capHeight', 'clip', 'clipPath', 'clipPathUnits', 'clipRule', 'colorInterpolation', 'colorInterpolationFilters', 'colorProfile', 'colorRendering', 'contentScriptType', 'contentStyleType', 'cursor', 'cx', 'cy', 'd', 'decelerate', 'descent', 'diffuseConstant', 'direction', 'display', 'divisor', 'dominantBaseline', 'dur', 'dx', 'dy', 'edgeMode', 'elevation', 'enableBackground', 'end', 'exponent', 'externalResourcesRequired', 'fill', 'fillOpacity', 'fillRule', 'filter', 'filterRes', 'filterUnits', 'floodColor', 'floodOpacity', 'focusable', 'fontFamily', 'fontSize', 'fontSizeAdjust', 'fontStretch', 'fontStyle', 'fontVariant', 'fontWeight', 'format', 'from', 'fx', 'fy', 'g1', 'g2', 'glyphName', 'glyphOrientationHorizontal', 'glyphOrientationVertical', 'glyphRef', 'gradientTransform', 'gradientUnits', 'hanging', 'horizAdvX', 'horizOriginX', 'href', 'ideographic', 'imageRendering', 'in2', 'in', 'intercept', 'k1', 'k2', 'k3', 'k4', 'k', 'kernelMatrix', 'kernelUnitLength', 'kerning', 'keyPoints', 'keySplines', 'keyTimes', 'lengthAdjust', 'letterSpacing', 'lightingColor', 'limitingConeAngle', 'local', 'markerEnd', 'markerHeight', 'markerMid', 'markerStart', 'markerUnits', 'markerWidth', 'mask', 'maskContentUnits', 'maskUnits', 'mathematical', 'mode', 'numOctaves', 'offset', 'opacity', 'operator', 'order', 'orient', 'orientation', 'origin', 'overflow', 'overlinePosition', 'overlineThickness', 'paintOrder', 'panose1', 'pathLength', 'patternContentUnits', 'patternTransform', 'patternUnits', 'pointerEvents', 'pointsAtX', 'pointsAtY', 'pointsAtZ', 'preserveAlpha', 'preserveAspectRatio', 'primitiveUnits', 'r', 'radius', 'refX', 'refY', 'renderingIntent', 'repeatCount', 'repeatDur', 'requiredExtensions', 'requiredFeatures', 'restart', 'result', 'rotate', 'rx', 'ry', 'seed', 'shapeRendering', 'slope', 'spacing', 'specularConstant', 'specularExponent', 'speed', 'spreadMethod', 'startOffset', 'stdDeviation', 'stemh', 'stemv', 'stitchTiles', 'stopColor', 'stopOpacity', 'strikethroughPosition', 'strikethroughThickness', 'string', 'stroke', 'strokeDasharray', 'strokeDashoffset', 'strokeLinecap', 'strokeLinejoin', 'strokeMiterlimit', 'strokeOpacity', 'strokeWidth', 'surfaceScale', 'systemLanguage', 'tableValues', 'targetX', 'targetY', 'textAnchor', 'textDecoration', 'textLength', 'textRendering', 'to', 'transform', 'u1', 'u2', 'underlinePosition', 'underlineThickness', 'unicode', 'unicodeBidi', 'unicodeRange', 'unitsPerEm', 'vAlphabetic', 'values', 'vectorEffect', 'version', 'vertAdvY', 'vertOriginX', 'vertOriginY', 'vHanging', 'vIdeographic', 'viewTarget', 'visibility', 'vMathematical', 'widths', 'wordSpacing', 'writingMode', 'x1', 'x2', 'x', 'xChannelSelector', 'xHeight', 'xlinkActuate', 'xlinkArcrole', 'xlinkHref', 'xlinkRole', 'xlinkShow', 'xlinkTitle', 'xlinkType', 'xmlBase', 'xmlLang', 'xmlns', 'xmlnsXlink', 'xmlSpace', 'y1', 'y2', 'y', 'yChannelSelector', 'z', 'zoomAndPan', 'ref', 'key', 'angle'];
var PolyElementKeys = ['points', 'pathLength'];

/** svg element types that have specific attribute filtration requirements */

/** map of svg element types to unique svg attributes that belong to that element */
export var FilteredElementKeyMap = {
  svg: SVGContainerPropKeys,
  polygon: PolyElementKeys,
  polyline: PolyElementKeys
};
export var EventKeys = ['dangerouslySetInnerHTML', 'onCopy', 'onCopyCapture', 'onCut', 'onCutCapture', 'onPaste', 'onPasteCapture', 'onCompositionEnd', 'onCompositionEndCapture', 'onCompositionStart', 'onCompositionStartCapture', 'onCompositionUpdate', 'onCompositionUpdateCapture', 'onFocus', 'onFocusCapture', 'onBlur', 'onBlurCapture', 'onChange', 'onChangeCapture', 'onBeforeInput', 'onBeforeInputCapture', 'onInput', 'onInputCapture', 'onReset', 'onResetCapture', 'onSubmit', 'onSubmitCapture', 'onInvalid', 'onInvalidCapture', 'onLoad', 'onLoadCapture', 'onError', 'onErrorCapture', 'onKeyDown', 'onKeyDownCapture', 'onKeyPress', 'onKeyPressCapture', 'onKeyUp', 'onKeyUpCapture', 'onAbort', 'onAbortCapture', 'onCanPlay', 'onCanPlayCapture', 'onCanPlayThrough', 'onCanPlayThroughCapture', 'onDurationChange', 'onDurationChangeCapture', 'onEmptied', 'onEmptiedCapture', 'onEncrypted', 'onEncryptedCapture', 'onEnded', 'onEndedCapture', 'onLoadedData', 'onLoadedDataCapture', 'onLoadedMetadata', 'onLoadedMetadataCapture', 'onLoadStart', 'onLoadStartCapture', 'onPause', 'onPauseCapture', 'onPlay', 'onPlayCapture', 'onPlaying', 'onPlayingCapture', 'onProgress', 'onProgressCapture', 'onRateChange', 'onRateChangeCapture', 'onSeeked', 'onSeekedCapture', 'onSeeking', 'onSeekingCapture', 'onStalled', 'onStalledCapture', 'onSuspend', 'onSuspendCapture', 'onTimeUpdate', 'onTimeUpdateCapture', 'onVolumeChange', 'onVolumeChangeCapture', 'onWaiting', 'onWaitingCapture', 'onAuxClick', 'onAuxClickCapture', 'onClick', 'onClickCapture', 'onContextMenu', 'onContextMenuCapture', 'onDoubleClick', 'onDoubleClickCapture', 'onDrag', 'onDragCapture', 'onDragEnd', 'onDragEndCapture', 'onDragEnter', 'onDragEnterCapture', 'onDragExit', 'onDragExitCapture', 'onDragLeave', 'onDragLeaveCapture', 'onDragOver', 'onDragOverCapture', 'onDragStart', 'onDragStartCapture', 'onDrop', 'onDropCapture', 'onMouseDown', 'onMouseDownCapture', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseMoveCapture', 'onMouseOut', 'onMouseOutCapture', 'onMouseOver', 'onMouseOverCapture', 'onMouseUp', 'onMouseUpCapture', 'onSelect', 'onSelectCapture', 'onTouchCancel', 'onTouchCancelCapture', 'onTouchEnd', 'onTouchEndCapture', 'onTouchMove', 'onTouchMoveCapture', 'onTouchStart', 'onTouchStartCapture', 'onPointerDown', 'onPointerDownCapture', 'onPointerMove', 'onPointerMoveCapture', 'onPointerUp', 'onPointerUpCapture', 'onPointerCancel', 'onPointerCancelCapture', 'onPointerEnter', 'onPointerEnterCapture', 'onPointerLeave', 'onPointerLeaveCapture', 'onPointerOver', 'onPointerOverCapture', 'onPointerOut', 'onPointerOutCapture', 'onGotPointerCapture', 'onGotPointerCaptureCapture', 'onLostPointerCapture', 'onLostPointerCaptureCapture', 'onScroll', 'onScrollCapture', 'onWheel', 'onWheelCapture', 'onAnimationStart', 'onAnimationStartCapture', 'onAnimationEnd', 'onAnimationEndCapture', 'onAnimationIteration', 'onAnimationIterationCapture', 'onTransitionEnd', 'onTransitionEndCapture'];

/** The type of easing function to use for animations */

/** Specifies the duration of animation, the unit of this option is ms. */

/** the offset of a chart, which define the blank space all around */

/**
 * The domain of axis.
 * This is the definition
 *
 * Numeric domain is always defined by an array of exactly two values, for the min and the max of the axis.
 * Categorical domain is defined as array of all possible values.
 *
 * Can be specified in many ways:
 * - array of numbers
 * - with special strings like 'dataMin' and 'dataMax'
 * - with special string math like 'dataMin - 100'
 * - with keyword 'auto'
 * - or a function
 * - array of functions
 * - or a combination of the above
 */

/**
 * NumberDomain is an evaluated {@link AxisDomain}.
 * Unlike {@link AxisDomain}, it has no variety - it's a tuple of two number.
 * This is after all the keywords and functions were evaluated and what is left is [min, max].
 *
 * Know that the min, max values are not guaranteed to be nice numbers - values like -Infinity or NaN are possible.
 *
 * There are also `category` axes that have different things than numbers in their domain.
 */

/** The props definition of base axis */

/** Defines how ticks are placed and whether / how tick collisions are handled.
 * 'preserveStart' keeps the left tick on collision and ensures that the first tick is always shown.
 * 'preserveEnd' keeps the right tick on collision and ensures that the last tick is always shown.
 * 'preserveStartEnd' keeps the left tick on collision and ensures that the first and last ticks are always shown.
 * 'equidistantPreserveStart' selects a number N such that every nTh tick will be shown without collision.
 */

export var adaptEventHandlers = function adaptEventHandlers(props, newHandler) {
  if (!props || typeof props === 'function' || typeof props === 'boolean') {
    return null;
  }
  var inputProps = props;
  if ( /*#__PURE__*/isValidElement(props)) {
    inputProps = props.props;
  }
  if (!isObject(inputProps)) {
    return null;
  }
  var out = {};
  Object.keys(inputProps).forEach(function (key) {
    if (EventKeys.includes(key)) {
      out[key] = newHandler || function (e) {
        return inputProps[key](inputProps, e);
      };
    }
  });
  return out;
};
var getEventHandlerOfChild = function getEventHandlerOfChild(originalHandler, data, index) {
  return function (e) {
    originalHandler(data, index, e);
    return null;
  };
};
export var adaptEventsOfChild = function adaptEventsOfChild(props, data, index) {
  if (!isObject(props) || _typeof(props) !== 'object') {
    return null;
  }
  var out = null;
  Object.keys(props).forEach(function (key) {
    var item = props[key];
    if (EventKeys.includes(key) && typeof item === 'function') {
      if (!out) out = {};
      out[key] = getEventHandlerOfChild(item, data, index);
    }
  });
  return out;
};