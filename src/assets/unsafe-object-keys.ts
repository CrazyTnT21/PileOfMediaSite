export function unsafeObjectKeys<T extends object>(item: T): (keyof T & string)[]
{
  return Object.keys(item) as (keyof T & string)[];
}
