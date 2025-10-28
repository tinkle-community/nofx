import type {
  AnyEqualityComparator,
  Cache,
  CircularState,
  Dictionary,
  State,
  TypeEqualityComparator,
} from './internalTypes';

const { getOwnPropertyNames, getOwnPropertySymbols } = Object;
const { hasOwnProperty } = Object.prototype;

/**
 * Combine two comparators into a single comparators.
 */
export function combineComparators<Meta>(
  comparatorA: AnyEqualityComparator<Meta>,
  comparatorB: AnyEqualityComparator<Meta>,
) {
  return function isEqual<A, B>(a: A, b: B, state: State<Meta>) {
    return comparatorA(a, b, state) && comparatorB(a, b, state);
  };
}

/**
 * Wrap the provided `areItemsEqual` method to manage the circular state, allowing
 * for circular references to be safely included in the comparison without creating
 * stack overflows.
 */
export function createIsCircular<
  AreItemsEqual extends TypeEqualityComparator<any, any>,
>(areItemsEqual: AreItemsEqual): AreItemsEqual {
  return function isCircular(
    a: any,
    b: any,
    state: CircularState<Cache<any, any>>,
  ) {
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
      return areItemsEqual(a, b, state);
    }

    const { cache } = state;

    const cachedA = cache.get(a);
    const cachedB = cache.get(b);

    if (cachedA && cachedB) {
      return cachedA === b && cachedB === a;
    }

    cache.set(a, b);
    cache.set(b, a);

    const result = areItemsEqual(a, b, state);

    cache.delete(a);
    cache.delete(b);

    return result;
  } as AreItemsEqual;
}

/**
 * Get the `@@toStringTag` of the value, if it exists.
 */
export function getShortTag(value: any): string | undefined {
  return value != null ? value[Symbol.toStringTag] : undefined;
}

/**
 * Get the properties to strictly examine, which include both own properties that are
 * not enumerable and symbol properties.
 */
export function getStrictProperties(
  object: Dictionary,
): Array<string | symbol> {
  return (getOwnPropertyNames(object) as Array<string | symbol>).concat(
    getOwnPropertySymbols(object),
  );
}

/**
 * Whether the object contains the property passed as an own property.
 */
export const hasOwn =
  Object.hasOwn ||
  ((object: Dictionary, property: number | string | symbol) =>
    hasOwnProperty.call(object, property));

/**
 * Whether the values passed are strictly equal or both NaN.
 */
export function sameValueZeroEqual(a: any, b: any): boolean {
  return a === b || (!a && !b && a !== a && b !== b);
}
