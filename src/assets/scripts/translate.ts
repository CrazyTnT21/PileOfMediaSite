import {Config} from "../classes/config";
import {getLanguageTag} from "../classes/language";
import {Translation} from "../translations/translation";
import {AppInput} from "assets/components/inputs/app-input/app-input";
import {Observer} from "../observer";
import {AppNumberInput} from "../components/inputs/app-number-input/app-number-input";
import {AppImageInput} from "../components/inputs/app-image-input/app-image-input";
import {AppTextArea} from "../components/inputs/app-textarea/app-textarea";
import {AppAutocomplete} from "../components/autocompletes/app-autocomplete/app-autocomplete";
import {AppLanguageAutocomplete} from "../components/autocompletes/app-language-autocomplete";
import {AppHeader} from "../components/app-header/app-header";
import {AppSearchInput} from "../components/inputs/app-search-input/app-search-input";
import {AppEmailInput} from "../components/inputs/app-email-input/app-email-input";
import {AppPasswordInput} from "../components/inputs/app-password-input/app-password-input";

async function main(): Promise<void>
{
  const elements = <NodeListOf<HTMLElement>>document.querySelectorAll("[data-translate]");
  const language = Config.preferredLanguages[0];
  document.querySelector("html")!.lang = getLanguageTag(language);
  const translation = await Config.translation();
  for (const element of elements)
  {
    const translated = element.getAttribute("data-translate")!;
    if (translated in translation)
      element.innerText = translation[<keyof Translation>translated]!;
    else
      console.warn(`Translation for '${translated}' does not exist for language '${language}'`);
  }
  document.querySelectorAll<HTMLElement>("[data-translate-attributes]").forEach(x => setTranslationAttribute(x, translation, language));
  document.querySelectorAll<AppInput>("app-input").forEach(x => setInputTexts(x, translation));
  document.querySelectorAll<AppNumberInput>("app-number-input").forEach(x => setNumberInputTexts(x, translation));
  document.querySelectorAll<AppEmailInput>("app-email-input").forEach(x => setEmailInputTexts(x, translation));
  document.querySelectorAll<AppSearchInput>("app-search-input").forEach(x => setSearchInputText(x, translation));
  document.querySelectorAll<AppPasswordInput>("app-password-input").forEach(x => setPasswordInputText(x, translation));
  document.querySelectorAll<AppImageInput>("app-image-input").forEach(x => setImageInputTexts(x, translation));
  document.querySelectorAll<AppTextArea>("app-textarea").forEach(x => setTextareaTexts(x, translation));
  document.querySelectorAll<AppAutocomplete>("app-autocomplete").forEach(x => setAutocompleteTexts(x, translation));
  document.querySelectorAll<AppLanguageAutocomplete>("app-language-autocomplete").forEach(x => setLanguageAutocompleteTexts(x, translation));
  document.querySelectorAll<AppHeader>("app-header").forEach(x => setHeaderTexts(x, translation));
}

function setTranslationAttribute(element: HTMLElement, translation: Translation, language: string): void
{
  const attributeKeys: string[] = element.getAttribute("data-translate-attributes")!.split(",");
  for (const attributeKey of attributeKeys)
  {
    const [attribute, key] = <[string, keyof Translation]>attributeKey.split(";");
    if (translation[key])
      element.setAttribute(attribute, translation[key]);
    else
      console.warn(`Translation for '${key}' does not exist for language '${language}'`);
  }

}

function setHeaderTexts(element: AppHeader, translation: Translation): void
{
  setIfExists(element, "books", translation.books);
  setIfExists(element, "graphicNovels", translation.graphicNovels);
  setIfExists(element, "movies", translation.movies);
  setIfExists(element, "shows", translation.shows);
  setIfExists(element, "games", translation.games);
  setIfExists(element, "profile", translation.profile);
  setIfExists(element, "friends", translation.friends);
  setIfExists(element, "comments", translation.comments);
  setIfExists(element, "reviews", translation.reviews);
  setIfExists(element, "settings", translation.settings);
  setIfExists(element, "preferences", translation.preferences);
  setIfExists(element, "logout", translation.logout);
  setIfExists(element, "login", translation.login);
  setIfExists(element, "signup", translation.signUp);
  setIfExists(element, "showingResults", translation.headerShowingResults);
  setSearchInputText(element.elements.searchInput, translation);
}

function setLanguageAutocompleteTexts(element: AppLanguageAutocomplete, translation: Translation): void
{
  setIfExists(element, "language", translation.language);
  setAutocompleteTexts(element, translation);
}

function setAutocompleteTexts(element: AppAutocomplete, translation: Translation): void
{
  setIfExists(element, "itemAlreadySelected", translation.autocompleteItemAlreadySelected);
  setIfExists(element, "itemNotFound", translation.autocompleteItemNotFound);
  setIfExists(element, "required", translation.required);
  setInputTexts(element, translation);
}

function setImageInputTexts(element: AppImageInput, translation: Translation): void
{
  setIfExists(element, "required", translation.required);
  setIfExists(element, "inputMinValidation", translation.imageInputMinSizesValidation);
  setIfExists(element, "inputMaxValidation", translation.imageInputMaxSizesValidation);
  setIfExists(element, "valueMissing", translation.valueMissing);
  setIfExists(element, "unsupportedImageType", translation.unsupportedImageType);
  setIfExists(element, "clearImage", translation.clearImage);
  setIfExists(element, "clearImages", translation.clearImages);
}

function setNumberInputTexts(element: AppNumberInput, translation: Translation): void
{
  setInputTexts(element, translation);
}

function setEmailInputTexts(element: AppEmailInput, translation: Translation): void
{
  setInputTexts(element, translation);
}


function setPasswordInputText(element: AppPasswordInput, translation: Translation): void
{
  setInputTexts(element, translation);
}

function setSearchInputText(element: AppSearchInput, translation: Translation): void
{
  setIfExists(element, "search", translation.search);
  setInputTexts(element, translation);
}

function setTextareaTexts(element: AppTextArea, translation: Translation): void
{
  setIfExists(element, "valueMissing", translation.valueMissing);
  setIfExists(element, "required", translation.required);
  setIfExists(element, "textareaMinValidation", translation.inputMinTextLengthValidation);
  setIfExists(element, "textareaMaxValidation", translation.inputMaxTextLengthValidation);
}

function setInputTexts(element: AppInput, translation: Translation): void
{
  setIfExists(element, "valueMissing", translation.valueMissing);
  setIfExists(element, "required", translation.required);
  setIfExists(element, "inputMinValidation", translation.inputMinTextLengthValidation);
  setIfExists(element, "inputMaxValidation", translation.inputMaxTextLengthValidation);
}

function setIfExists<T extends {
  texts: Observer<U>
}, U extends object>(element: T, key: keyof U, translation: U[keyof U] | null): void
{
  if (translation)
    element.texts.set(key, translation)
}

await main();
