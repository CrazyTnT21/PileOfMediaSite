import {Language} from "./language.js";

export class Config
{
  dateFormatter: Intl.DateTimeFormat = this.#dateFormatter();

  static #config: Config = (() =>
  {
    const config = localStorage.getItem("config");
    if (config)
      return <Config>JSON.parse(config);
    return new Config();
  })()


  static getConfig()
  {
    return this.#config;
  }

  static setConfig(value: Config)
  {
    this.#config = value;
    localStorage.setItem("config", JSON.stringify(value));
  }

  language: Language = Language.EN;

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
