import * as language from "./language.js";
import {Translation} from "../translations/translation";
import {get} from "../scripts/http";

export class Config
{
  static dateFormatter: Intl.DateTimeFormat = ((): Intl.DateTimeFormat =>
  {
    const dateFormat = localStorage.getItem("date-format");
    if (dateFormat)
    {
      return Intl.DateTimeFormat(JSON.parse(dateFormat));
    }
    return new Intl.DateTimeFormat();
  })()

  static readonly config: Config = ((): Config =>
  {
    const config = localStorage.getItem("config");
    if (config)
      return <Config>JSON.parse(config);
    return new Config();
  })()

  static languageCode: language.LanguageCode = language.LanguageCode.EN;

  static get languageTag(): language.languageTag
  {
    return language.getLanguageTag(Config.languageCode);
  }

  private static readonly translations = new Map();

  static async translation(): Promise<Translation | undefined>
  {
    const languageCode = Config.languageCode;
    if (Config.translations.has(languageCode))
      return Config.translations.get(languageCode)!;

    try
    {
      const uri = getTranslationUri(languageCode);
      const result: Translation | undefined = await get(uri);
      Config.translations.set(languageCode, result);
      return result;
    }
    catch (e)
    {
      console.error(`Error while processing the translation for language '${languageCode}'`, e);
      const result: Translation | undefined = await get(getTranslationUri(language.LanguageCode.EN))
      Config.translations.set(languageCode, result);
      return result;
    }
  }
}

function getTranslationUri(code: language.LanguageCode): `/assets/translations/translation_${language.LanguageCode}.json`
{
  return `/assets/translations/translation_${code}.json`;
}
