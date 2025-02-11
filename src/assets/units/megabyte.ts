import {Kilobyte} from "./kilobyte";
import {Byte} from "./byte";

export class Megabyte
{
  private readonly value: Byte;

  private constructor(value: Byte)
  {
    this.value = value;
  }

  /**
   * Creates a megabyte from a kilobyte representation
   * @example
   * const value: number = 4000; //4000 bytes
   * const kilobyte: Kilobyte = Kilobyte.fromByte(value)
   * const megabyte: Megabyte = Megabyte.fromKilobyte(kilobyte);
   * const result = megabyte.toByte() == value;
   * //prints true
   * console.log(result);
   */
  static fromKilobyte(value: Kilobyte): Megabyte
  {
    return Megabyte.fromByte(value.toByte())
  }

  /**
   * Creates a kilobyte from a megabyte representation
   * @example
   * const value: number = 4000; //4000 bytes
   * const megabyte: Megabyte = Megabyte.fromByte(value)
   * const kilobyte: Kilobyte = megabyte.toKilobyte();
   * const result = kilobyte.toByte() == value;
   * //prints true
   * console.log(result);
   */
  toKilobyte(): Kilobyte
  {
    return Kilobyte.fromByte(this.value);
  }

  /**
   * Creates a megabyte from its byte representation
   * @example
   * const value: number = 2000; //2000 bytes
   * const megabyte: Megabyte = Megabyte.fromByte(value);
   * const result = megabyte.toByte() == value;
   * //prints true
   * console.log(result);
   */
  static fromByte(byte: Byte): Megabyte
  {
    return new Megabyte(byte)
  }

  /**
   * Creates a megabyte from its numeric representation
   * @example
   * const value: number = 2; //2 mB
   * const megabyte: Megabyte = Megabyte.fromNumber(value);
   * const result = megabyte.toByte() == value * 1000 * 1000;
   * //prints true
   * console.log(result);
   */
  static fromNumber(byte: number): Megabyte
  {
    return new Megabyte(byte * 1000 * 1000)
  }

  /**
   * Create a byte from its megabyte representation
   * @example
   * const value: number = 120; //120 bytes
   * const megabyte: Megabyte = Megabyte.fromByte(value);
   * const result = megabyte.toByte() == value;
   * //prints true
   * console.log(result);
   */
  toByte(): Byte
  {
    return this.value;
  }

  /**
   * Create a number from its megabyte representation
   * @example
   * const value: number = 12; //12 Megabytes
   * const megabyte: Megabyte = Megabyte.fromByte(value * 1000 * 1000);
   * const result = megabyte.toNumber() == value;
   * //prints true
   * console.log(result);
   */
  toNumber(): number
  {
    return this.value / 1000 / 1000;
  }

  eq(other: Megabyte): boolean
  {
    return other.value == this.value
  }

  less(other: Megabyte): boolean
  {
    return this.value < other.value
  }

  more(other: Megabyte): boolean
  {
    return this.value > other.value
  }
}
