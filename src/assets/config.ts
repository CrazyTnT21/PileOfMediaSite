import {type LanguageCode} from "./i18n/language";
import {indexArray, NonEmptyArray} from "./components/inputs/common";

type SerializedConfig = { locales: Intl.UnicodeBCP47LocaleIdentifier[] };

export class Config
{
  private constructor(locales: NonEmptyArray<Intl.Locale>)
  {
    this.locales = locales;
  }

  public locales: NonEmptyArray<Intl.Locale>;

  public static config: Config = ((): Config =>
  {
    const config = localStorage.getItem("config");
    if (config)
    {
      const parsed: SerializedConfig = JSON.parse(config);
      return new Config(parsed.locales.map(x => new Intl.Locale(x)) as NonEmptyArray<Intl.Locale>)
    }
    return Config.default();
  })();

  public static default(): Config
  {
    let locales: NonEmptyArray<Intl.Locale>;
    if (navigator.language.length == 0)
      locales = [new Intl.Locale("en")]
    else
      locales = navigator.languages.map(x => new Intl.Locale(x)) as NonEmptyArray<Intl.Locale>;
    return new Config(locales);
  }

  public static saveConfiguration(): void
  {
    const serialized: SerializedConfig = {locales: Config.config.locales.map(x => x.toString())};
    localStorage.setItem("config", JSON.stringify(serialized));
  }

  public get languages(): NonEmptyArray<LanguageCode>
  {
    const result = Config.config.locales.map(x => x.language.toUpperCase() as LanguageCode);
    return result as NonEmptyArray<LanguageCode>;
  }
}

export function logError(error: Error): void
{
  console.error(error);
}

export function acceptLanguageHeader(): { "Accept-Language": string }
{
  return {"Accept-Language": Config.config.locales.map(x => x.baseName).join(",")}
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
  for (const language of Config.config.languages)
  {
    const translation = item.translations.translations[language];
    if (translation)
      return {language, translation};
  }
  const key = indexArray(Object.keys(item.translations.translations), 0).unwrap();

  return {language: key as LanguageCode, translation: item.translations.translations[key]!};
}
