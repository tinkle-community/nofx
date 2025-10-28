import type { CustomEqualCreatorOptions } from './internalTypes.d.ts';
import { sameValueZeroEqual } from './utils.ts';
export { sameValueZeroEqual };
export type { AnyEqualityComparator, Cache, CircularState, ComparatorConfig, CreateCustomComparatorConfig, CreateState, CustomEqualCreatorOptions, DefaultState, Dictionary, EqualityComparator, EqualityComparatorCreator, InternalEqualityComparator, PrimitiveWrapper, State, TypeEqualityComparator, TypedArray, } from './internalTypes.d.ts';
/**
 * Whether the items passed are deeply-equal in value.
 */
export declare const deepEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are deeply-equal in value based on strict comparison.
 */
export declare const strictDeepEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are deeply-equal in value, including circular references.
 */
export declare const circularDeepEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are deeply-equal in value, including circular references,
 * based on strict comparison.
 */
export declare const strictCircularDeepEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are shallowly-equal in value.
 */
export declare const shallowEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are shallowly-equal in value based on strict comparison
 */
export declare const strictShallowEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are shallowly-equal in value, including circular references.
 */
export declare const circularShallowEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are shallowly-equal in value, including circular references,
 * based on strict comparison.
 */
export declare const strictCircularShallowEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Create a custom equality comparison method.
 *
 * This can be done to create very targeted comparisons in extreme hot-path scenarios
 * where the standard methods are not performant enough, but can also be used to provide
 * support for legacy environments that do not support expected features like
 * `RegExp.prototype.flags` out of the box.
 */
export declare function createCustomEqual<Meta = undefined>(options?: CustomEqualCreatorOptions<Meta>): <A, B>(a: A, b: B) => boolean;
