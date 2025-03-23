import {Translation} from "../translations/translation";
import {get} from "../scripts/http";
import {LanguageCode} from "./language";

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
  })();

  static preferredLanguages: [LanguageCode, ...LanguageCode[]] = [LanguageCode.EN];

  private static readonly translations = new Map();

  static async translation(): Promise<Translation>
  {
    for (const x of Config.preferredLanguages)
    {
      const languageCode = x;
      if (Config.translations.has(languageCode))
        return Config.translations.get(languageCode);

      try
      {
        const result: Translation | undefined = await get(getTranslationUri(languageCode));
        if (result)
        {
          Config.translations.set(languageCode, result);
          return result;
        }
      }
      catch (e)
      {
        console.error(`Error while processing the translation for language '${languageCode}'`, e);
      }
    }

    if (!Config.translations.has(LanguageCode.EN))
      Config.translations.set(LanguageCode.EN, await get(getTranslationUri(LanguageCode.EN)))

    return Config.translations.get(LanguageCode.EN);
  }
}

function getTranslationUri(code: LanguageCode): `/assets/translations/translation_${LanguageCode}.json`
{
  return `/assets/translations/translation_${code}.json`;
}

export function logError(error: Error): void
{
  console.error(error);
}

export function acceptLanguageHeader(): { "Accept-Language": string }
{
  return {"Accept-Language": Config.preferredLanguages.join(",")}
}

export type translationItem = {
  translations: { translations: { [p: string]: any } }
};
type translatedField<T extends translationItem> = T["translations"]["translations"][""];

export function getTranslatedField<T extends translationItem>(item: T): {
  language: LanguageCode,
  translation: translatedField<T>
}
{
  for (const language of Config.preferredLanguages)
  {
    const translation = item.translations.translations[language];
    if (translation)
      return {language, translation};
  }
  const key = Object.keys(item.translations.translations)[0]!;

  return {language: key as LanguageCode, translation: item.translations.translations[key]!};
}
