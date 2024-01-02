import {Config} from "./config.js";
import {Language} from "/assets/classes/language.js";
import {get} from "./http.js";

"use strict";

const elements = document.querySelectorAll("[data-translate]");
const language = Config.getConfig().language;
getTranslation(language).then(translation =>
{
  document.querySelector("html").lang = getLanguageCode(language).toLowerCase();
  for (let i = 0; i < elements.length; i++)
  {
    if (translation[elements[i].dataset.translate])
      elements[i].innerText = translation[elements[i].dataset.translate];
    else
      console.warn(`Translation for '${elements[i].dataset.translate}' does not exist for language '${language}'`);
  }
});

/**
 *
 * @param language {string}
 * @returns {Promise<Translation>}
 */
async function getTranslation(language)
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

function getLanguageCode(language)
{
  switch (language)
  {
    case Language.EN:
      return "EN";
    case Language.DE:
      return "DE";
    case Language.NL:
      return "NL";
    case Language.KO:
      return "KO";
    case Language.JA:
      return "JA";
    case Language.DA:
      return "DA";
    case Language.ES:
      return "ES";
    default:
      return "EN";
  }
}

function getTranslationUri(code)
{
  return `/assets/translations/translation_${code}.json`;
}
