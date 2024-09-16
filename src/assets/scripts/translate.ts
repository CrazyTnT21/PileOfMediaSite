import {Config} from "../classes/config.js";
import {get} from "./http.js";
import {getLanguageCode, Language, LanguageCode} from "../classes/language.js";
import {Translation} from "../translations/translation.js";

const elements = <NodeListOf<HTMLElement>>document.querySelectorAll("[data-translate]");
const language = Config.getConfig().language;
getTranslation(language).then(translation =>
{
  document.querySelector("html")!.lang = getLanguageCode(language).toLowerCase();
  for (const element of elements)
  {
    const translated = element.dataset["translate"]!;
    if (translated in translation)
      element.innerText = translation[<keyof Translation>translated]!;
    else
      console.warn(`Translation for '${translated}' does not exist for language '${language}'`);
  }
});

async function getTranslation(language: Language): Promise<Translation>
{
  try
  {
    const uri = getTranslationUri(getLanguageCode(language));
    return await get(uri);
  }
  catch (e)
  {
    console.error(`Error while processing the translation for language '${language}'`);
    return await get(getTranslationUri(getLanguageCode(Language.EN)));
  }
}

function getTranslationUri(code: LanguageCode)
{
  return `/assets/translations/translation_${code}.json`;
}
