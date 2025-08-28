export function enumerate<T>(iter: T[]): [number, T][]
{
  return iter.map((x, i) => [i, x]);
}
