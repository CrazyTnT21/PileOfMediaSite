import {Translation} from "./translations/translation";
import {get} from "./scripts/http";
import {type LanguageCode, LanguageCodes} from "./language";
import {indexArray, NonEmptyArray} from "./components/inputs/common";

export class Config
{
  public static dateFormatter: Intl.DateTimeFormat = ((): Intl.DateTimeFormat =>
  {
    const dateFormat = localStorage.getItem("date-format");
    if (dateFormat)
    {
      return Intl.DateTimeFormat(JSON.parse(dateFormat));
    }
    return new Intl.DateTimeFormat();
  })()

  public static readonly config: Config = ((): Config =>
  {
    const config = localStorage.getItem("config");
    if (config)
      return <Config>JSON.parse(config);
    return new Config();
  })();

  public static preferredLanguages: NonEmptyArray<LanguageCode> = [LanguageCodes.EN];

  private static readonly translations = new Map();

  public static async translation(): Promise<Translation>
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

    if (!Config.translations.has(LanguageCodes.EN))
      Config.translations.set(LanguageCodes.EN, await get(getTranslationUri(LanguageCodes.EN)))

    return Config.translations.get(LanguageCodes.EN);
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

export type TranslationItem = {
  translations: { translations: { [p: string]: any } }
};
type TranslatedField<T extends TranslationItem> = T["translations"]["translations"][""];

export function getTranslatedField<T extends TranslationItem>(item: T): {
  language: LanguageCode,
  translation: TranslatedField<T>
}
{
  for (const language of Config.preferredLanguages)
  {
    const translation = item.translations.translations[language];
    if (translation)
      return {language, translation};
  }
  const key = indexArray(Object.keys(item.translations.translations), 0).unwrap();

  return {language: key as LanguageCode, translation: item.translations.translations[key]!};
}
