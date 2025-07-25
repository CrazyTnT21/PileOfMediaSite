export const LanguageTexts = {
  EN: "English",
  DE: "Deutsch",
  ES: "Español",
  DA: "Dansk",
  NL: "Nederlandse",
  JA: "日本語",
  KO: "한국인",
} as const;

const keys = <LanguageCode[]>Object.keys(LanguageTexts);
export const LanguageCodes = keys.reduce((previousValue, currentValue) =>
{
  Object.defineProperty(previousValue, currentValue, {value: currentValue, configurable: false});
  return previousValue;
}, {} as { [Key in LanguageCode]: Key });
export type LanguageCode = keyof typeof LanguageTexts;
export type LanguageText = typeof LanguageTexts[LanguageCode]
