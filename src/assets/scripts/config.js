import {Language} from "/assets/classes/language.js";

export const DateStyle = Object.freeze({
  iso: 0,
  eu: 1,
  us: 2,
});

export class Config
{
  dateStyle = this.defaultDateStyle();

  /**
   *
   * @type {Config | {}}
   */
  static #config = localStorage.getItem("config") ?? new Config();

  static getConfig()
  {
    return this.#config;
  }

  static setConfig(value)
  {
    this.#config = value;
    localStorage.setItem("config", value);
  }

  defaultDateStyle()
  {
    const dateStyle = localStorage.getItem("dateStyle");

    if (dateStyle)
      return Number(dateStyle);
    return DateStyle.iso;
  }

  language = Language.EN;
}
