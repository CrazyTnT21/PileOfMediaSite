import {type LanguageCode, LanguageCodes} from "./i18n/language";
import {indexArray, NonEmptyArray} from "./components/inputs/common";

export class Config
{
  public locale: Intl.Locale = ((): Intl.Locale =>
  {

    const locale = localStorage.getItem("locale");
    if (locale)
    {
      const parsed: { tag: Intl.UnicodeBCP47LocaleIdentifier, options: Intl.LocaleOptions } = JSON.parse(locale);
      return new Intl.Locale(parsed.tag, parsed.options);
    }
    return new Intl.Locale(navigator.language);
  })();

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
  return {"Accept-Language": Config.preferredLanguages.map(x => x.toLowerCase()).join(",")}
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
