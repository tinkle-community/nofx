import type { AnyEqualityComparator, Dictionary, State, TypeEqualityComparator } from './internalTypes.d.ts';
/**
 * Combine two comparators into a single comparators.
 */
export declare function combineComparators<Meta>(comparatorA: AnyEqualityComparator<Meta>, comparatorB: AnyEqualityComparator<Meta>): <A, B>(a: A, b: B, state: State<Meta>) => boolean;
/**
 * Wrap the provided `areItemsEqual` method to manage the circular state, allowing
 * for circular references to be safely included in the comparison without creating
 * stack overflows.
 */
export declare function createIsCircular<AreItemsEqual extends TypeEqualityComparator<any, any>>(areItemsEqual: AreItemsEqual): AreItemsEqual;
/**
 * Get the `@@toStringTag` of the value, if it exists.
 */
export declare function getShortTag(value: any): string | undefined;
/**
 * Get the properties to strictly examine, which include both own properties that are
 * not enumerable and symbol properties.
 */
export declare function getStrictProperties(object: Dictionary): Array<string | symbol>;
/**
 * Whether the object contains the property passed as an own property.
 */
export declare const hasOwn: (o: object, v: PropertyKey) => boolean;
/**
 * Whether the values passed are strictly equal or both NaN.
 */
export declare function sameValueZeroEqual(a: any, b: any): boolean;
