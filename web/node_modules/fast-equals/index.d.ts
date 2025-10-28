/**
 * Cache used to store references to objects, used for circular
 * reference checks.
 */
export interface Cache<Key extends object, Value> {
  delete(key: Key): boolean;
  get(key: Key): Value | undefined;
  set(key: Key, value: any): any;
}

export interface State<Meta> {
  /**
   * Cache used to identify circular references
   */
  readonly cache: Cache<any, any> | undefined;
  /**
   * Method used to determine equality of nested value.
   */
  readonly equals: InternalEqualityComparator<Meta>;
  /**
   * Additional value that can be used for comparisons.
   */
  meta: Meta;
  /**
   * Whether the equality comparison is strict, meaning it matches
   * all properties (including symbols and non-enumerable properties)
   * with equal shape of descriptors.
   */
  readonly strict: boolean;
}

export interface CircularState<Meta> extends State<Meta> {
  readonly cache: Cache<any, any>;
}

export interface DefaultState<Meta> extends State<Meta> {
  readonly cache: undefined;
}

export interface Dictionary<Value = any> {
  [key: string | symbol]: Value;
  $$typeof?: any;
}

export interface ComparatorConfig<Meta> {
  /**
   * Whether the arrays passed are equal in value. In strict mode, this includes
   * additional properties added to the array.
   */
  areArraysEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether the dates passed are equal in value.
   */
  areDatesEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether the errors passed are equal in value.
   */
  areErrorsEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether the functions passed are equal in value.
   */
  areFunctionsEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether the maps passed are equal in value. In strict mode, this includes
   * additional properties added to the map.
   */
  areMapsEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether the numbers passed are equal in value.
   */
  areNumbersEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether the objects passed are equal in value. In strict mode, this includes
   * non-enumerable properties added to the map, as well as symbol properties.
   */
  areObjectsEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether the primitive wrappers passed are equal in value.
   */
  arePrimitiveWrappersEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether the regexps passed are equal in value.
   */
  areRegExpsEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether the sets passed are equal in value. In strict mode, this includes
   * additional properties added to the set.
   */
  areSetsEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether the typed arrays passed are equal in value. In strict mode, this includes
   * additional properties added to the typed array.
   */
  areTypedArraysEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether the URLs passed are equal in value.
   */
  areUrlsEqual: TypeEqualityComparator<any, Meta>;
  /**
   * Whether two values with unknown `@@toStringTag` are equal in value. This comparator is
   * called when no other comparator applies.
   *
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
   */
  unknownTagComparators:
    | Record<string, TypeEqualityComparator<any, Meta>>
    | undefined;
}

export type CreateCustomComparatorConfig<Meta> = (
  config: ComparatorConfig<Meta>,
) => Partial<ComparatorConfig<Meta>>;

export type CreateState<Meta> = () => {
  cache?: Cache<any, any> | undefined;
  meta?: Meta;
};

export type EqualityComparator<Meta> = <A, B>(
  a: A,
  b: B,
  state: State<Meta>,
) => boolean;
export type AnyEqualityComparator<Meta> = (
  a: any,
  b: any,
  state: State<Meta>,
) => boolean;

export type EqualityComparatorCreator<Meta> = (
  fn: EqualityComparator<Meta>,
) => InternalEqualityComparator<Meta>;

export type InternalEqualityComparator<Meta> = (
  a: any,
  b: any,
  indexOrKeyA: any,
  indexOrKeyB: any,
  parentA: any,
  parentB: any,
  state: State<Meta>,
) => boolean;

// We explicitly check for primitive wrapper types
// eslint-disable-next-line @typescript-eslint/ban-types
export type PrimitiveWrapper = Boolean | Number | String;

/**
 * Type which encompasses possible instances of TypedArray
 * classes.
 *
 * **NOTE**: This does not include `BigInt64Array` and
 * `BitUint64Array` because those are part of ES2020 and
 * not supported by certain TS configurations. If using
 * either in `areTypedArraysEqual`, you can cast the
 * instance as `TypedArray` and it will work as expected,
 * because runtime checks will still work for those classes.
 */
export type TypedArray =
  | Float32Array
  | Float64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint16Array
  | Uint32Array
  | Uint8Array
  | Uint8ClampedArray;

export type TypeEqualityComparator<Type, Meta = undefined> = (
  a: Type,
  b: Type,
  state: State<Meta>,
) => boolean;

export interface CustomEqualCreatorOptions<Meta> {
  /**
   * Whether circular references should be supported. It causes the
   * comparison to be slower, but for objects that have circular references
   * it is required to avoid stack overflows.
   */
  circular?: boolean;
  /**
   * Create a custom configuration of type-specific equality comparators.
   * This receives the default configuration, which allows either replacement
   * or supersetting of the default methods.
   */
  createCustomConfig?: CreateCustomComparatorConfig<Meta>;
  /**
   * Create a custom internal comparator, which is used as an override to the
   * default entry point for nested value equality comparisons. This is often
   * used for doing custom logic for specific types (such as handling a specific
   * class instance differently than other objects) or to incorporate `meta` in
   * the comparison. See the recipes for examples.
   */
  createInternalComparator?: (
    compare: EqualityComparator<Meta>,
  ) => InternalEqualityComparator<Meta>;
  /**
   * Create a custom `state` object passed between the methods. This allows for
   * custom `cache` and/or `meta` values to be used.
   */
  createState?: CreateState<Meta>;
  /**
   * Whether the equality comparison is strict, meaning it matches
   * all properties (including symbols and non-enumerable properties)
   * with equal shape of descriptors.
   */
  strict?: boolean;
}


/**
 * Whether the values passed are strictly equal or both NaN.
 */
export declare const sameValueZeroEqual: <A, B>(a: A, b: B) => boolean;

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
 * support for legacy environments that cannot polyfill for modern features expected by
 * `fast-equals`, such as `WeakMap` or `RegExp.prototype.flags`.
 */
export declare function createCustomEqual<Meta = undefined>(
  options?: CustomEqualCreatorOptions<Meta>,
): <A, B>(a: A, b: B) => boolean;