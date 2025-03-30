type Identifier = `${string | number | bigint}.${number}`;

/**
 * Observe changes to an object
 * @example
 * const item = new Observer({required: "Required"});
 * const element = document.createElement("div");
 * element.innerText = item.get("required");
 * const identifier = item.addListener("required", (value) =>
 * {
 *  element.innerText = value;
 * });
 * console.info(element.innerText); // Prints "Required"
 * item.set("required","Needed");
 * console.info(element.innerText); // Prints "Needed"
 * item.removeListener(identifier);
 *
 * item.set("required","Required");
 * console.info(element.innerText); // Still prints "Needed"
 */
export class Observer<T extends object>
{
  private readonly item: T;
  private readonly listeners: Map<any, Map<number, Callback<any>>>;

  constructor(item: T)
  {
    this.item = item;
    const keys = <(keyof T)[]>Object.keys(item);
    const map = new Map();
    for (const key of keys)
    {
      map.set(key, new Map())
    }
    this.listeners = map;
  }

  set<K extends keyof T>(key: K, value: T[K]): void
  {
    const previousValue = this.item[key];
    this.item[key] = value;
    const listeners = this.listeners.get(key)!;
    for (const [_, callback] of listeners)
    {
      callback(value, previousValue);
    }
  }

  get<K extends keyof T>(key: K,): T[K]
  {
    return this.item[key];
  }

  addListener<K extends keyof T>(key: K, callback: Callback<T, K>): Identifier
  {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomNumber = array[0]!;
    const identifier = `${key.toString()}.${randomNumber}` as const;
    const map = this.listeners.get(key)!;
    map.set(randomNumber, callback)
    return identifier;
  }

  removeListener(identifier: Identifier): void
  {
    const [key, number] = identifier.split(".");
    this.listeners.get(<keyof T>key)!.delete(Number(number!))
  }
}

type Callback<T, K extends keyof T = any> = (value: T[K], previousValue: T[K]) => void;
