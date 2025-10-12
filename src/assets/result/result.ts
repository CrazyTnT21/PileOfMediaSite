/**
 * Result is a union type with the variants, {@link Ok}, representing success and containing a value, and {@link Err}, representing error and containing an error value.
 */
export type Result<T, E = never> = Ok<T, E> | Err<T, E>;

export class Ok<T, E>
{
  private readonly internalOk: T;

  public get ok(): T
  {
    return this.internalOk;
  }

  public get error(): undefined
  {
    return;
  }

  public get is_ok(): true
  {
    return true;
  }

  public get is_err(): false
  {
    return false;
  }

  public constructor(value: T)
  {
    this.internalOk = value;
  }

  /**
   * Returns the contained Ok value. Throws if it is an {@link Err} variant.
   */
  public unwrap(): T
  {
    return this.internalOk
  }

  /**
   * Returns the contained Error value. Throws if it is an {@link Ok} variant.
   */
  public unwrapErr(): never
  {
    throw new Error("Called unwrapErr on an `Ok` value", {cause: this.internalOk})
  }

  /**
   * Computes a new ok value from the callback if this is an {@link Ok} variant and returns it.
   * Otherwise, returns the {@link Err} variant.
   */
  public andThen<T1>(fn: (x: T) => Result<T1, E>): Result<T1, E>
  {
    return fn(this.internalOk)
  }

  /**
   * Returns the contained Ok value or computes it from the callback
   */
  public unwrapOrElse(_fn: (x: E) => T): T
  {
    return this.internalOk;
  }

  /**
   * Computes a new ok value from the callback if this is an {@link Ok} variant and returns it as a new result.
   * Otherwise, returns the {@link Err} variant.
   */
  public map<T1>(fn: (x: T) => T1): Result<T1, E>
  {
    return new Ok(fn(this.internalOk));
  }

  /**
   * Computes a new err value from the callback if this is an {@link Err} variant and returns it as a new result.
   * Otherwise, returns the {@link Ok} variant.
   */
  public map_err<E1>(_fn: (x: E) => E1): Result<T, E1>
  {
    // Since this an Ok variant and does not contain an E value, it is ok to pretend that E is E1.
    return this as unknown as Result<T, E1>;
  }
}

export class Err<T, E>
{
  public get ok(): undefined
  {
    return;
  }

  public get is_ok(): false
  {
    return false;
  }

  public get is_err(): true
  {
    return true;
  }

  public get error(): E
  {
    return this.internalError;
  }

  private readonly internalError: E

  public constructor(error: E)
  {
    this.internalError = error;
  }

  public unwrap(): never
  {
    throw new Error("Called unwrap on an `Error` value", {cause: this.internalError});
  }

  public unwrapErr(): E
  {
    return this.internalError;
  }

  public andThen<T1>(_fn: (x: T) => Result<T1, E>): Result<T1, E>
  {
    // Since this an Err variant and does not contain a T value, it is ok to pretend that T1 is T.
    return this as unknown as Result<T1, E>;
  }

  public unwrapOrElse<T>(fn: (x: E) => T): T
  {
    return fn(this.internalError)
  }

  public map<T1>(_fn: (x: T) => T1): Result<T1, E>
  {
    /**
     * @see andThen
     */
    return this as unknown as Result<T1, E>;
  }

  public map_err<E1>(fn: (x: E) => E1): Result<T, E1>
  {
    return new Err(fn(this.internalError));
  }
}

export function filterErrors<T, E>(...results: Result<T, E>[]): E[]
{
  return results.filter(x => x.is_err).map(x => x.error)
}

/**
 * Maps an array of {@link Result}<T,E> into a {@link Result}<T[],E>, if all elements are {@link Ok} variants.
 * Otherwise, returns the first {@link Err} variant.
 */
export function collect_ok<T, E, Original extends [...Result<T, E>[]]>(...results: Result<T, E>[] & Original): Result<MappedTuple<T, Original>, E>
{
  const oks: T[] = []
  for (const result of results)
  {
    if (result.is_err)
    {
      // Since this an Err variant and does not contain a T value, it is ok to pretend that T is MappedTuple<T, Original>.
      return result as unknown as Result<MappedTuple<T, Original>, E>;
    }
    oks.push(result.ok)
  }
  return new Ok(oks) as Result<MappedTuple<T, Original>, E>
}

type SameSizeTuple<FirstTuple extends [...any], SecondTuple extends [...any]> = FirstTuple["length"] extends SecondTuple["length"] ? true : false;
type InnerMappedTuple<T, Original extends [...any], Tuple extends [...T[]]> = SameSizeTuple<Original, Tuple> extends true ? Tuple : InnerMappedTuple<T, Original, [T, ...Tuple]>
type MappedTuple<T, Original extends [...any]> = IsTuple<Original> extends true ? InnerMappedTuple<T, Original, []> : T[]

type IsTuple<T> = T extends [any, ...any] ? true : false
