export declare const mathSign: (value: number) => 0 | 1 | -1;
export declare const isPercent: (value: string | number) => value is `${number}%`;
export declare const isNumber: (value: unknown) => value is number;
export declare const isNullish: (value: unknown) => value is null;
export declare const isNumOrStr: (value: unknown) => value is string | number;
export declare const uniqueId: (prefix?: string) => string;
/**
 * Get percent value of a total value
 * @param {number|string} percent A percent
 * @param {number} totalValue     Total value
 * @param {number} defaultValue   The value returned when percent is undefined or invalid
 * @param {boolean} validate      If set to be true, the result will be validated
 * @return {number} value
 */
export declare const getPercentValue: (percent: number | string, totalValue: number, defaultValue?: number, validate?: boolean) => number;
export declare const getAnyElementOfObject: (obj: any) => any;
export declare const hasDuplicate: (ary: Array<any>) => boolean;
export declare const interpolateNumber: (numberA: number, numberB: number) => (t: number) => number;
export declare function findEntryInArray<T>(ary: Array<T>, specifiedKey: number | string | ((entry: T) => unknown), specifiedValue: unknown): T;
/**
 * The least square linear regression
 * @param {Array} data The array of points
 * @returns {Object} The domain of x, and the parameter of linear function
 */
export declare const getLinearRegression: (data: Array<{
    cx?: number;
    cy?: number;
}>) => {
    xmin: number;
    xmax: number;
    a: number;
    b: number;
};
/**
 * Compare values.
 *
 * This function is intended to be passed to `Array.prototype.sort()`. It properly compares generic homogeneous arrays that are either `string[]`,
 * `number[]`, or `Date[]`. When comparing heterogeneous arrays or homogeneous arrays of other types, it will attempt to compare items properly but
 * will fall back to string comparison for mismatched or unsupported types.
 *
 * For some background, `Array.prototype.sort()`'s default comparator coerces each of the array's items into a string and compares the strings. This
 * often leads to undesirable behavior, especially with numerical items.
 *
 * @param {unknown} a The first item to compare
 * @param {unknown} b The second item to compare
 * @return {number} A negative number if a < b, a positive number if a > b, 0 if equal
 */
export declare const compareValues: (a: unknown, b: unknown) => number;
