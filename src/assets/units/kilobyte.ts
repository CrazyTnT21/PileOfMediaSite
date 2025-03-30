import {Megabyte} from "./megabyte";
import {Byte} from "./byte";

export class Kilobyte
{
  private readonly value: Byte;

  private constructor(value: Byte)
  {
    this.value = value;
  }

  /**
   * Creates a kilobyte from a megabyte representation
   * @example
   * const value: number = 4000; //4000 bytes
   * const megabyte: Megabyte = Megabyte.fromByte(value)
   * const kilobyte: Kilobyte = Kilobyte.fromMegabyte(megabyte);
   * const result = kilobyte.toByte() == value;
   * //prints true
   * console.info(result);
   */
  static fromMegabyte(value: Megabyte): Kilobyte
  {
    return Kilobyte.fromByte(value.toByte())
  }

  /**
   * Creates a megabyte from a kilobyte representation
   * @example
   * const value: number = 4000; //4000 bytes
   * const kilobyte: Kilobyte = Kilobyte.fromByte(value)
   * const megabyte: Megabyte = kilobyte.toMegabyte();
   * const result = megabyte.toByte() == value;
   * //prints true
   * console.info(result);
   */
  toMegabyte(): Megabyte
  {
    return Megabyte.fromByte(this.value);
  }

  /**
   * Creates a kilobyte from its byte representation
   * @example
   * const value: number = 2000; //2000 bytes
   * const kilobyte: Kilobyte = Kilobyte.fromByte(value);
   * const result = kilobyte.toByte() == value;
   * //prints true
   * console.info(result);
   */
  static fromByte(byte: Byte): Kilobyte
  {
    return new Kilobyte(byte)
  }

  /**
   * Creates a kilobyte from its numeric representation
   * @example
   * const value: number = 2; //2 kB
   * const kilobyte: Kilobyte = Kilobyte.fromNumber(value);
   * const result = kilobyte.toByte() == value * 1000;
   * //prints true
   * console.info(result);
   */
  static fromNumber(byte: number): Kilobyte
  {
    return new Kilobyte(byte * 1000)
  }

  /**
   * Create a byte from its kilobyte representation
   * @example
   * const value: number = 120; //120 bytes
   * const kilobyte: Kilobyte = Kilobyte.fromByte(value);
   * const result = kilobyte.toByte() == value;
   * //prints true
   * console.info(result);
   */
  toByte(): Byte
  {
    return this.value;
  }

  /**
   * Create a number from its kilobyte representation
   * @example
   * const value: number = 12; //12 Kilobytes
   * const kilobyte: Kilobyte = Kilobyte.fromByte(value * 1000);
   * const result = kilobyte.toNumber() == value;
   * //prints true
   * console.info(result);
   */
  toNumber(): number
  {
    return this.value / 1000;
  }

  eq(other: Kilobyte): boolean
  {
    return other.value == this.value
  }

  less(other: Kilobyte): boolean
  {
    return this.value < other.value
  }

  more(other: Kilobyte): boolean
  {
    return this.value > other.value
  }

  toString(): string
  {
    return `${this.toNumber()} kB`
  }
}
