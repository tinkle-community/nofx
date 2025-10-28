/**
 * Given an array and a number N, return a new array which contains every nTh
 * element of the input array. For n below 1, an empty array is returned.
 * If isValid is provided, all candidates must suffice the condition, else undefined is returned.
 * @param {T[]} array An input array.
 * @param {integer} n A number
 * @param {Function} isValid A function to evaluate a candidate form the array
 * @returns {T[]} The result array of the same type as the input array.
 */
export function getEveryNthWithCondition(array, n, isValid) {
  if (n < 1) {
    return [];
  }
  if (n === 1 && isValid === undefined) {
    return array;
  }
  var result = [];
  for (var i = 0; i < array.length; i += n) {
    if (isValid === undefined || isValid(array[i]) === true) {
      result.push(array[i]);
    } else {
      return undefined;
    }
  }
  return result;
}