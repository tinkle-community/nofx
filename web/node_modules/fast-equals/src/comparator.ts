import {
  areArraysEqual as areArraysEqualDefault,
  areDatesEqual as areDatesEqualDefault,
  areErrorsEqual as areErrorsEqualDefault,
  areFunctionsEqual as areFunctionsEqualDefault,
  areMapsEqual as areMapsEqualDefault,
  areNumbersEqual as areNumbersEqualDefault,
  areObjectsEqual as areObjectsEqualDefault,
  areObjectsEqualStrict as areObjectsEqualStrictDefault,
  arePrimitiveWrappersEqual as arePrimitiveWrappersEqualDefault,
  areRegExpsEqual as areRegExpsEqualDefault,
  areSetsEqual as areSetsEqualDefault,
  areTypedArraysEqual as areTypedArraysEqualDefault,
  areUrlsEqual as areUrlsEqualDefault,
} from './equals';
import { combineComparators, createIsCircular, getShortTag } from './utils';
import type {
  ComparatorConfig,
  CreateState,
  CustomEqualCreatorOptions,
  EqualityComparator,
  InternalEqualityComparator,
  State,
} from './internalTypes';

const ARGUMENTS_TAG = '[object Arguments]';
const BOOLEAN_TAG = '[object Boolean]';
const DATE_TAG = '[object Date]';
const ERROR_TAG = '[object Error]';
const MAP_TAG = '[object Map]';
const NUMBER_TAG = '[object Number]';
const OBJECT_TAG = '[object Object]';
const REG_EXP_TAG = '[object RegExp]';
const SET_TAG = '[object Set]';
const STRING_TAG = '[object String]';
const URL_TAG = '[object URL]';

const { isArray } = Array;
const isTypedArray =
  typeof ArrayBuffer === 'function' && ArrayBuffer.isView
    ? ArrayBuffer.isView
    : null;
const { assign } = Object;
const getTag = Object.prototype.toString.call.bind(
  Object.prototype.toString,
) as (a: object) => string;

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
export function createEqualityComparator<Meta>({
  areArraysEqual,
  areDatesEqual,
  areErrorsEqual,
  areFunctionsEqual,
  areMapsEqual,
  areNumbersEqual,
  areObjectsEqual,
  arePrimitiveWrappersEqual,
  areRegExpsEqual,
  areSetsEqual,
  areTypedArraysEqual,
  areUrlsEqual,
  unknownTagComparators,
}: ComparatorConfig<Meta>): EqualityComparator<Meta> {
  /**
   * compare the value of the two objects and return true if they are equivalent in values
   */
  return function comparator(a: any, b: any, state: State<Meta>): boolean {
    // If the items are strictly equal, no need to do a value comparison.
    if (a === b) {
      return true;
    }

    // If either of the items are nullish and fail the strictly equal check
    // above, then they must be unequal.
    if (a == null || b == null) {
      return false;
    }

    const type = typeof a;

    if (type !== typeof b) {
      return false;
    }

    if (type !== 'object') {
      if (type === 'number') {
        return areNumbersEqual(a, b, state);
      }

      if (type === 'function') {
        return areFunctionsEqual(a, b, state);
      }

      // If a primitive value that is not strictly equal, it must be unequal.
      return false;
    }

    const constructor = a.constructor;

    // Checks are listed in order of commonality of use-case:
    //   1. Common complex object types (plain object, array)
    //   2. Common data values (date, regexp)
    //   3. Less-common complex object types (map, set)
    //   4. Less-common data values (promise, primitive wrappers)
    // Inherently this is both subjective and assumptive, however
    // when reviewing comparable libraries in the wild this order
    // appears to be generally consistent.

    // Constructors should match, otherwise there is potential for false positives
    // between class and subclass or custom object and POJO.
    if (constructor !== b.constructor) {
      return false;
    }

    // `isPlainObject` only checks against the object's own realm. Cross-realm
    // comparisons are rare, and will be handled in the ultimate fallback, so
    // we can avoid capturing the string tag.
    if (constructor === Object) {
      return areObjectsEqual(a, b, state);
    }

    // `isArray()` works on subclasses and is cross-realm, so we can avoid capturing
    // the string tag or doing an `instanceof` check.
    if (isArray(a)) {
      return areArraysEqual(a, b, state);
    }

    // `isTypedArray()` works on all possible TypedArray classes, so we can avoid
    // capturing the string tag or comparing against all possible constructors.
    if (isTypedArray != null && isTypedArray(a)) {
      return areTypedArraysEqual(a, b, state);
    }

    // Try to fast-path equality checks for other complex object types in the
    // same realm to avoid capturing the string tag. Strict equality is used
    // instead of `instanceof` because it is more performant for the common
    // use-case. If someone is subclassing a native class, it will be handled
    // with the string tag comparison.

    if (constructor === Date) {
      return areDatesEqual(a, b, state);
    }

    if (constructor === RegExp) {
      return areRegExpsEqual(a, b, state);
    }

    if (constructor === Map) {
      return areMapsEqual(a, b, state);
    }

    if (constructor === Set) {
      return areSetsEqual(a, b, state);
    }

    // Since this is a custom object, capture the string tag to determing its type.
    // This is reasonably performant in modern environments like v8 and SpiderMonkey.
    const tag = getTag(a);

    if (tag === DATE_TAG) {
      return areDatesEqual(a, b, state);
    }

    // For RegExp, the properties are not enumerable, and therefore will give false positives if
    // tested like a standard object.
    if (tag === REG_EXP_TAG) {
      return areRegExpsEqual(a, b, state);
    }

    if (tag === MAP_TAG) {
      return areMapsEqual(a, b, state);
    }

    if (tag === SET_TAG) {
      return areSetsEqual(a, b, state);
    }

    if (tag === OBJECT_TAG) {
      // The exception for value comparison is custom `Promise`-like class instances. These should
      // be treated the same as standard `Promise` objects, which means strict equality, and if
      // it reaches this point then that strict equality comparison has already failed.
      return (
        typeof a.then !== 'function' &&
        typeof b.then !== 'function' &&
        areObjectsEqual(a, b, state)
      );
    }

    // If a URL tag, it should be tested explicitly. Like RegExp, the properties are not
    // enumerable, and therefore will give false positives if tested like a standard object.
    if (tag === URL_TAG) {
      return areUrlsEqual(a, b, state);
    }

    // If an error tag, it should be tested explicitly. Like RegExp, the properties are not
    // enumerable, and therefore will give false positives if tested like a standard object.
    if (tag === ERROR_TAG) {
      return areErrorsEqual(a, b, state);
    }

    // If an arguments tag, it should be treated as a standard object.
    if (tag === ARGUMENTS_TAG) {
      return areObjectsEqual(a, b, state);
    }

    // As the penultimate fallback, check if the values passed are primitive wrappers. This
    // is very rare in modern JS, which is why it is deprioritized compared to all other object
    // types.
    if (tag === BOOLEAN_TAG || tag === NUMBER_TAG || tag === STRING_TAG) {
      return arePrimitiveWrappersEqual(a, b, state);
    }

    if (unknownTagComparators) {
      let unknownTagComparator = unknownTagComparators[tag];

      if (!unknownTagComparator) {
        const shortTag = getShortTag(a);

        if (shortTag) {
          unknownTagComparator = unknownTagComparators[shortTag];
        }
      }

      // If the custom config has an unknown tag comparator that matches the captured tag or the
      // @@toStringTag, it is the source of truth for whether the values are equal.
      if (unknownTagComparator) {
        return unknownTagComparator(a, b, state);
      }
    }

    // If not matching any tags that require a specific type of comparison, then we hard-code false because
    // the only thing remaining is strict equality, which has already been compared. This is for a few reasons:
    //   - Certain types that cannot be introspected (e.g., `WeakMap`). For these types, this is the only
    //     comparison that can be made.
    //   - For types that can be introspected, but rarely have requirements to be compared
    //     (`ArrayBuffer`, `DataView`, etc.), the cost is avoided to prioritize the common
    //     use-cases (may be included in a future release, if requested enough).
    //   - For types that can be introspected but do not have an objective definition of what
    //     equality is (`Error`, etc.), the subjective decision is to be conservative and strictly compare.
    // In all cases, these decisions should be reevaluated based on changes to the language and
    // common development practices.
    return false;
  };
}

/**
 * Create the configuration object used for building comparators.
 */
export function createEqualityComparatorConfig<Meta>({
  circular,
  createCustomConfig,
  strict,
}: CustomEqualCreatorOptions<Meta>): ComparatorConfig<Meta> {
  let config = {
    areArraysEqual: strict
      ? areObjectsEqualStrictDefault
      : areArraysEqualDefault,
    areDatesEqual: areDatesEqualDefault,
    areErrorsEqual: areErrorsEqualDefault,
    areFunctionsEqual: areFunctionsEqualDefault,
    areMapsEqual: strict
      ? combineComparators(areMapsEqualDefault, areObjectsEqualStrictDefault)
      : areMapsEqualDefault,
    areNumbersEqual: areNumbersEqualDefault,
    areObjectsEqual: strict
      ? areObjectsEqualStrictDefault
      : areObjectsEqualDefault,
    arePrimitiveWrappersEqual: arePrimitiveWrappersEqualDefault,
    areRegExpsEqual: areRegExpsEqualDefault,
    areSetsEqual: strict
      ? combineComparators(areSetsEqualDefault, areObjectsEqualStrictDefault)
      : areSetsEqualDefault,
    areTypedArraysEqual: strict
      ? areObjectsEqualStrictDefault
      : areTypedArraysEqualDefault,
    areUrlsEqual: areUrlsEqualDefault,
    unknownTagComparators: undefined,
  };

  if (createCustomConfig) {
    config = assign({}, config, createCustomConfig(config));
  }

  if (circular) {
    const areArraysEqual = createIsCircular(config.areArraysEqual);
    const areMapsEqual = createIsCircular(config.areMapsEqual);
    const areObjectsEqual = createIsCircular(config.areObjectsEqual);
    const areSetsEqual = createIsCircular(config.areSetsEqual);

    config = assign({}, config, {
      areArraysEqual,
      areMapsEqual,
      areObjectsEqual,
      areSetsEqual,
    });
  }

  return config;
}

/**
 * Default equality comparator pass-through, used as the standard `isEqual` creator for
 * use inside the built comparator.
 */
export function createInternalEqualityComparator<Meta>(
  compare: EqualityComparator<Meta>,
): InternalEqualityComparator<Meta> {
  return function (
    a: any,
    b: any,
    _indexOrKeyA: any,
    _indexOrKeyB: any,
    _parentA: any,
    _parentB: any,
    state: State<Meta>,
  ) {
    return compare(a, b, state);
  };
}

/**
 * Create the `isEqual` function used by the consuming application.
 */
export function createIsEqual<Meta>({
  circular,
  comparator,
  createState,
  equals,
  strict,
}: CreateIsEqualOptions<Meta>) {
  if (createState) {
    return function isEqual<A, B>(a: A, b: B): boolean {
      const { cache = circular ? new WeakMap() : undefined, meta } =
        createState!();

      return comparator(a, b, {
        cache,
        equals,
        meta,
        strict,
      } as State<Meta>);
    };
  }

  if (circular) {
    return function isEqual<A, B>(a: A, b: B): boolean {
      return comparator(a, b, {
        cache: new WeakMap(),
        equals,
        meta: undefined as Meta,
        strict,
      } as State<Meta>);
    };
  }

  const state = {
    cache: undefined,
    equals,
    meta: undefined,
    strict,
  } as State<Meta>;

  return function isEqual<A, B>(a: A, b: B): boolean {
    return comparator(a, b, state);
  };
}
