import {Config} from "../classes/config";
import {getLanguageTag} from "../classes/language";
import {Translation} from "../translations/translation";

const elements = <NodeListOf<HTMLElement>>document.querySelectorAll("[data-translate]");
const language = Config.preferredLanguages[0];
document.querySelector("html")!.lang = getLanguageTag(language);
Config.translation().then(translation =>
{
  for (const element of elements)
  {
    const translated = element.getAttribute("data-translate")!;
    if (translated in translation)
      element.innerText = translation[<keyof Translation>translated]!;
    else
      console.warn(`Translation for '${translated}' does not exist for language '${language}'`);
  }
});
