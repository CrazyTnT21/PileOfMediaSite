import {type LanguageCode, LanguageCodes} from "./i18n/language";
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

  public static preferredLanguages: NonEmptyArray<LanguageCode> = [navigator.language.split("-")[0]?.toUpperCase() as LanguageCode ?? LanguageCodes.EN];
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
