export type Result<T, E = never> = Ok<T, E> | Err<T, E>;

export class Err<T, E>
{
  public get data(): undefined
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
  private readonly internalData: T;

  public get data(): T
  {
    return this.internalData;
  }

  public get error(): undefined
  {
    return;
  }

  public constructor(data: T)
  {
    this.internalData = data;
  }

  public unwrap(): T
  {
    return this.internalData
  }

  public unwrapErr(): never
  {
    throw new Error("Called unwrapErr on an `Ok` value")
  }

  public andThen<T1>(fn: (x: T) => Result<T1, E>): Result<T1, E>
  {
    return fn(this.internalData)
  }

  public unwrapOrElse<E>(_fn: (x: E) => T): T
  {
    return this.internalData;
  }
}

