import {Config} from "../classes/config.js";
import {get} from "./http.js";
import {LanguageCode, getLanguageTag} from "../classes/language.js";
import {Translation} from "../translations/translation.js";

const elements = <NodeListOf<HTMLElement>>document.querySelectorAll("[data-translate]");
const language = Config.languageCode;
getTranslation(language).then(translation =>
{
  document.querySelector("html")!.lang = getLanguageTag(language);
  for (const element of elements)
  {
    const translated = element.dataset["translate"]!;
    if (translated in translation)
      element.innerText = translation[<keyof Translation>translated]!;
    else
      console.warn(`Translation for '${translated}' does not exist for language '${language}'`);
  }
});

async function getTranslation(language: LanguageCode): Promise<Translation>
{
  try
  {
    const uri = getTranslationUri(language);
    return await get(uri);
  }
  catch (e)
  {
    console.error(`Error while processing the translation for language '${language}'`, e);
    return await get(getTranslationUri(LanguageCode.EN));
  }
}

function getTranslationUri(code: LanguageCode): `/assets/translations/translation_${LanguageCode}.json`
{
  return `/assets/translations/translation_${code}.json`;
}
