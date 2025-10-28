import { getAngledRectangleWidth } from './CartesianUtils';
import { getEveryNthWithCondition } from './getEveryNthWithCondition';
export function getAngledTickWidth(contentSize, unitSize, angle) {
  var size = {
    width: contentSize.width + unitSize.width,
    height: contentSize.height + unitSize.height
  };
  return getAngledRectangleWidth(size, angle);
}
export function getTickBoundaries(viewBox, sign, sizeKey) {
  var isWidth = sizeKey === 'width';
  var x = viewBox.x,
    y = viewBox.y,
    width = viewBox.width,
    height = viewBox.height;
  if (sign === 1) {
    return {
      start: isWidth ? x : y,
      end: isWidth ? x + width : y + height
    };
  }
  return {
    start: isWidth ? x + width : y + height,
    end: isWidth ? x : y
  };
}
export function isVisible(sign, tickPosition, getSize, start, end) {
  /* Since getSize() is expensive (it reads the ticks' size from the DOM), we do this check first to avoid calculating
   * the tick's size. */
  if (sign * tickPosition < sign * start || sign * tickPosition > sign * end) {
    return false;
  }
  var size = getSize();
  return sign * (tickPosition - sign * size / 2 - start) >= 0 && sign * (tickPosition + sign * size / 2 - end) <= 0;
}
export function getNumberIntervalTicks(ticks, interval) {
  return getEveryNthWithCondition(ticks, interval + 1);
}