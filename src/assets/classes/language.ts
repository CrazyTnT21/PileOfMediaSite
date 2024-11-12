import {components} from "mycollection-openapi";

export enum Language
{
  EN = "English",
  DE = "Deutsch",
  ES = "Español",
  DA = "Dansk",
  NL = "Nederlandse",
  JA = "日本語",
  KO = "한국인",
  //TODO: Use correct translations
}

export enum LanguageCode
{
  EN = "EN",
  DE = "DE",
  ES = "ES",
  DA = "DA",
  NL = "NL",
  JA = "JA",
  KO = "KO"
}

export function getLanguageCode(language: Language): LanguageCode
{
  switch (language)
  {
    case Language.EN:
      return LanguageCode.EN;
    case Language.DE:
      return LanguageCode.DE;
    case Language.NL:
      return LanguageCode.NL;
    case Language.KO:
      return LanguageCode.KO;
    case Language.JA:
      return LanguageCode.JA;
    case Language.DA:
      return LanguageCode.DA;
    case Language.ES:
      return LanguageCode.ES;
    default:
      return LanguageCode.EN;
  }
}

export function getLanguage(language: LanguageCode): Language
{
  switch (language)
  {
    case LanguageCode.EN:
      return Language.EN;
    case LanguageCode.DE:
      return Language.DE;
    case LanguageCode.NL:
      return Language.NL;
    case LanguageCode.KO:
      return Language.KO;
    case LanguageCode.JA:
      return Language.JA;
    case LanguageCode.DA:
      return Language.DA;
    case LanguageCode.ES:
      return Language.ES;
    default:
      return Language.EN;
  }
}

export type languageTag = "en" | "de" | "es" | "da" | "nl" | "ja" | "ko";

export function getLanguageTag(language: LanguageCode | components["schemas"]["Language"]): languageTag
{
  switch (language as LanguageCode)
  {
    case LanguageCode.EN:
      return "en";
    case LanguageCode.DE:
      return "de";
    case LanguageCode.ES:
      return "es";
    case LanguageCode.DA:
      return "da";
    case LanguageCode.NL:
      return "nl";
    case LanguageCode.JA:
      return "ja";
    case LanguageCode.KO:
      return "ko";
  }
}
