function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
export var AccessibilityManager = /*#__PURE__*/function () {
  function AccessibilityManager() {
    _classCallCheck(this, AccessibilityManager);
    _defineProperty(this, "activeIndex", 0);
    _defineProperty(this, "coordinateList", []);
    _defineProperty(this, "layout", 'horizontal');
  }
  return _createClass(AccessibilityManager, [{
    key: "setDetails",
    value: function setDetails(_ref) {
      var _ref2;
      var _ref$coordinateList = _ref.coordinateList,
        coordinateList = _ref$coordinateList === void 0 ? null : _ref$coordinateList,
        _ref$container = _ref.container,
        container = _ref$container === void 0 ? null : _ref$container,
        _ref$layout = _ref.layout,
        layout = _ref$layout === void 0 ? null : _ref$layout,
        _ref$offset = _ref.offset,
        offset = _ref$offset === void 0 ? null : _ref$offset,
        _ref$mouseHandlerCall = _ref.mouseHandlerCallback,
        mouseHandlerCallback = _ref$mouseHandlerCall === void 0 ? null : _ref$mouseHandlerCall;
      this.coordinateList = (_ref2 = coordinateList !== null && coordinateList !== void 0 ? coordinateList : this.coordinateList) !== null && _ref2 !== void 0 ? _ref2 : [];
      this.container = container !== null && container !== void 0 ? container : this.container;
      this.layout = layout !== null && layout !== void 0 ? layout : this.layout;
      this.offset = offset !== null && offset !== void 0 ? offset : this.offset;
      this.mouseHandlerCallback = mouseHandlerCallback !== null && mouseHandlerCallback !== void 0 ? mouseHandlerCallback : this.mouseHandlerCallback;

      // Keep activeIndex in the bounds between 0 and the last coordinate index
      this.activeIndex = Math.min(Math.max(this.activeIndex, 0), this.coordinateList.length - 1);
    }
  }, {
    key: "focus",
    value: function focus() {
      this.spoofMouse();
    }
  }, {
    key: "keyboardEvent",
    value: function keyboardEvent(e) {
      // The AccessibilityManager relies on the Tooltip component. When tooltips suddenly stop existing,
      // it can cause errors. We use this function to check. We don't want arrow keys to be processed
      // if there are no tooltips, since that will cause unexpected behavior of users.
      if (this.coordinateList.length === 0) {
        return;
      }
      switch (e.key) {
        case 'ArrowRight':
          {
            if (this.layout !== 'horizontal') {
              return;
            }
            this.activeIndex = Math.min(this.activeIndex + 1, this.coordinateList.length - 1);
            this.spoofMouse();
            break;
          }
        case 'ArrowLeft':
          {
            if (this.layout !== 'horizontal') {
              return;
            }
            this.activeIndex = Math.max(this.activeIndex - 1, 0);
            this.spoofMouse();
            break;
          }
        default:
          {
            break;
          }
      }
    }
  }, {
    key: "setIndex",
    value: function setIndex(newIndex) {
      this.activeIndex = newIndex;
    }
  }, {
    key: "spoofMouse",
    value: function spoofMouse() {
      var _window, _window2;
      if (this.layout !== 'horizontal') {
        return;
      }

      // This can happen when the tooltips suddenly stop existing as children of the component
      // That update doesn't otherwise fire events, so we have to double check here.
      if (this.coordinateList.length === 0) {
        return;
      }
      var _this$container$getBo = this.container.getBoundingClientRect(),
        x = _this$container$getBo.x,
        y = _this$container$getBo.y,
        height = _this$container$getBo.height;
      var coordinate = this.coordinateList[this.activeIndex].coordinate;
      var scrollOffsetX = ((_window = window) === null || _window === void 0 ? void 0 : _window.scrollX) || 0;
      var scrollOffsetY = ((_window2 = window) === null || _window2 === void 0 ? void 0 : _window2.scrollY) || 0;
      var pageX = x + coordinate + scrollOffsetX;
      var pageY = y + this.offset.top + height / 2 + scrollOffsetY;
      this.mouseHandlerCallback({
        pageX: pageX,
        pageY: pageY
      });
    }
  }]);
}();