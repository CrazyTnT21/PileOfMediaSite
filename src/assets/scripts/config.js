import {Language} from "/assets/classes/language.js";


export class Config
{
  /**
   * @type {Intl.DateTimeFormat}
   */
  dateFormatter = this.#dateFormatter();

  /**
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

  language = Language.EN;

  #dateFormatter()
  {
    const dateFormat = localStorage.getItem("date-format");
    if (dateFormat)
    {
      return Intl.DateTimeFormat(JSON.parse(dateFormat));
    }
    return new Intl.DateTimeFormat();
  }
}
