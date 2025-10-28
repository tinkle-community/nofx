import { sameValueZeroEqual } from './utils.ts';
import type { Dictionary, PrimitiveWrapper, State, TypedArray } from './internalTypes.d.ts';
/**
 * Whether the arrays are equal in value.
 */
export declare function areArraysEqual(a: any[], b: any[], state: State<any>): boolean;
/**
 * Whether the dates passed are equal in value.
 */
export declare function areDatesEqual(a: Date, b: Date): boolean;
/**
 * Whether the errors passed are equal in value.
 */
export declare function areErrorsEqual(a: Error, b: Error): boolean;
/**
 * Whether the functions passed are equal in value.
 */
export declare function areFunctionsEqual(a: (...args: any[]) => any, b: (...args: any[]) => any): boolean;
/**
 * Whether the `Map`s are equal in value.
 */
export declare function areMapsEqual(a: Map<any, any>, b: Map<any, any>, state: State<any>): boolean;
/**
 * Whether the numbers are equal in value.
 */
export declare const areNumbersEqual: typeof sameValueZeroEqual;
/**
 * Whether the objects are equal in value.
 */
export declare function areObjectsEqual(a: Dictionary, b: Dictionary, state: State<any>): boolean;
/**
 * Whether the objects are equal in value with strict property checking.
 */
export declare function areObjectsEqualStrict(a: Dictionary, b: Dictionary, state: State<any>): boolean;
/**
 * Whether the primitive wrappers passed are equal in value.
 */
export declare function arePrimitiveWrappersEqual(a: PrimitiveWrapper, b: PrimitiveWrapper): boolean;
/**
 * Whether the regexps passed are equal in value.
 */
export declare function areRegExpsEqual(a: RegExp, b: RegExp): boolean;
/**
 * Whether the `Set`s are equal in value.
 */
export declare function areSetsEqual(a: Set<any>, b: Set<any>, state: State<any>): boolean;
/**
 * Whether the TypedArray instances are equal in value.
 */
export declare function areTypedArraysEqual(a: TypedArray, b: TypedArray): boolean;
/**
 * Whether the URL instances are equal in value.
 */
export declare function areUrlsEqual(a: URL, b: URL): boolean;
