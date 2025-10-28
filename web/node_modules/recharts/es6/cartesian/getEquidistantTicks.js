import { isVisible } from '../util/TickUtils';
import { getEveryNthWithCondition } from '../util/getEveryNthWithCondition';
export function getEquidistantTicks(sign, boundaries, getTickSize, ticks, minTickGap) {
  var result = (ticks || []).slice();
  var initialStart = boundaries.start,
    end = boundaries.end;
  var index = 0;
  // Premature optimisation idea 1: Estimate a lower bound, and start from there.
  // For now, start from every tick
  var stepsize = 1;
  var start = initialStart;
  var _loop = function _loop() {
      // Given stepsize, evaluate whether every stepsize-th tick can be shown.
      // If it can not, then increase the stepsize by 1, and try again.

      var entry = ticks === null || ticks === void 0 ? void 0 : ticks[index];

      // Break condition - If we have evaluate all the ticks, then we are done.
      if (entry === undefined) {
        return {
          v: getEveryNthWithCondition(ticks, stepsize)
        };
      }

      // Check if the element collides with the next element
      var i = index;
      var size;
      var getSize = function getSize() {
        if (size === undefined) {
          size = getTickSize(entry, i);
        }
        return size;
      };
      var tickCoord = entry.coordinate;
      // We will always show the first tick.
      var isShow = index === 0 || isVisible(sign, tickCoord, getSize, start, end);
      if (!isShow) {
        // Start all over with a larger stepsize
        index = 0;
        start = initialStart;
        stepsize += 1;
      }
      if (isShow) {
        // If it can be shown, update the start
        start = tickCoord + sign * (getSize() / 2 + minTickGap);
        index += stepsize;
      }
    },
    _ret;
  while (stepsize <= result.length) {
    _ret = _loop();
    if (_ret) return _ret.v;
  }
  return [];
}