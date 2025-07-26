export function unsafeObjectKeys<T extends object>(item: T): (keyof T)[]
{
  return Object.keys(item) as (keyof T)[];
}
