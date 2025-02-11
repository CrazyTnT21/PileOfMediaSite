export type Result<T, E = never> = Ok<T, E> | Err<T, E>;

export class Err<T, E>
{
  public get ok(): undefined
  {
    return;
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
    throw new Error("Called unwrap on an `Error` value")
  }

  public unwrapErr(): E
  {
    return this.internalError;
  }

  public andThen<T1>(_fn: (x: T) => Result<T1, E>): Result<T1, E>
  {
    //return new Err(this.error)
    return this as unknown as Result<T1, E>;
  }

  public unwrapOrElse<T>(fn: (x: E) => T): T
  {
    return fn(this.internalError)
  }
}

export class Ok<T, E>
{
  private readonly internalOk: T;

  public get ok(): T
  {
    return this.internalOk;
  }

  public get error(): undefined
  {
    return
  }

  public constructor(value: T)
  {
    this.internalOk = value;
  }

  public unwrap(): T
  {
    return this.internalOk
  }

  public unwrapErr(): never
  {
    throw new Error("Called unwrapErr on an `Ok` value")
  }

  public andThen<T1>(fn: (x: T) => Result<T1, E>): Result<T1, E>
  {
    return fn(this.internalOk)
  }

  public unwrapOrElse<E>(_fn: (x: E) => T): T
  {
    return this.internalOk;
  }
}

export function filterErrors<T, E>(...results: Result<T, E>[]): E[]
{
  return results.filter(x => x.error).map(x => x.error!)
}

export function collect_ok<T, E, Original extends [...Result<T, E>[]]>(...results: Result<T, E>[] & Original): Result<MappedTuple<T, Original>, E>
{
  const oks = []
  for (const {ok, error} of results)
  {
    if (error)
      return new Err(error) as Result<MappedTuple<T, Original>, E>
    oks.push(ok)
  }
  return new Ok(oks) as Result<MappedTuple<T, Original>, E>
}

type sameSizeTuple<FirstTuple extends [...any], SecondTuple extends [...any]> = FirstTuple["length"] extends SecondTuple["length"] ? true : false;
type InnerMappedTuple<T, Original extends [...any], Tuple extends [...T[]]> = sameSizeTuple<Original, Tuple> extends true ? Tuple : InnerMappedTuple<T, Original, [T, ...Tuple]>
type MappedTuple<T, Original extends [...any]> = IsTuple<Original> extends true ? InnerMappedTuple<T, Original, []> : T[]

type IsTuple<T> = T extends [any, ...any] ? true : false

