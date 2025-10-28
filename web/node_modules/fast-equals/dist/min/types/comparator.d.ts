import type { ComparatorConfig, CreateState, CustomEqualCreatorOptions, EqualityComparator, InternalEqualityComparator } from './internalTypes.d.ts';
interface CreateIsEqualOptions<Meta> {
    circular: boolean;
    comparator: EqualityComparator<Meta>;
    createState: CreateState<Meta> | undefined;
    equals: InternalEqualityComparator<Meta>;
    strict: boolean;
}
/**
 * Create a comparator method based on the type-specific equality comparators passed.
 */
export declare function createEqualityComparator<Meta>({ areArraysEqual, areDatesEqual, areErrorsEqual, areFunctionsEqual, areMapsEqual, areNumbersEqual, areObjectsEqual, arePrimitiveWrappersEqual, areRegExpsEqual, areSetsEqual, areTypedArraysEqual, areUrlsEqual, unknownTagComparators, }: ComparatorConfig<Meta>): EqualityComparator<Meta>;
/**
 * Create the configuration object used for building comparators.
 */
export declare function createEqualityComparatorConfig<Meta>({ circular, createCustomConfig, strict, }: CustomEqualCreatorOptions<Meta>): ComparatorConfig<Meta>;
/**
 * Default equality comparator pass-through, used as the standard `isEqual` creator for
 * use inside the built comparator.
 */
export declare function createInternalEqualityComparator<Meta>(compare: EqualityComparator<Meta>): InternalEqualityComparator<Meta>;
/**
 * Create the `isEqual` function used by the consuming application.
 */
export declare function createIsEqual<Meta>({ circular, comparator, createState, equals, strict, }: CreateIsEqualOptions<Meta>): <A, B>(a: A, b: B) => boolean;
export {};
