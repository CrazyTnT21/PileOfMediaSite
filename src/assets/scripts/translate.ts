import {Config} from "../config";
import {Translation} from "../translations/translation";
import type {AppInput, InputTag} from "assets/components/inputs/app-input/app-input";
import {Observer} from "../observer";
import type {AppNumberInput, NumberInputTag} from "../components/inputs/app-number-input/app-number-input";
import type {AppImageInput, ImageInputTag} from "../components/inputs/app-image-input/app-image-input";
import type {AppTextArea, TextAreaTag} from "../components/inputs/app-textarea/app-textarea";
import type {AppAutocomplete, AutocompleteTag} from "../components/autocompletes/app-autocomplete/app-autocomplete";
import type {
  AppLanguageAutocomplete,
  LanguageAutocompleteTag
} from "../components/autocompletes/app-language-autocomplete";
import type {AppHeader, HeaderTag} from "../components/app-header/app-header";
import type {AppSearchInput, SearchInputTag} from "../components/inputs/app-search-input/app-search-input";
import type {AppEmailInput, EmailInputTag} from "../components/inputs/app-email-input/app-email-input";
import type {AppPasswordInput, PasswordInputTag} from "../components/inputs/app-password-input/app-password-input";
import {LanguageCodes} from "../language";

async function main(): Promise<void>
{
  const elements = <NodeListOf<HTMLElement>>document.querySelectorAll("[data-translate]");
  const language = Config.preferredLanguages[0];
  document.querySelector("html")!.lang = LanguageCodes[language].toLowerCase();
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
  await Promise.all(
      [
        setInputTexts(document.querySelectorAll("app-input"), translation),
        setNumberInputTexts(document.querySelectorAll("app-number-input"), translation),
        setEmailInputTexts(document.querySelectorAll("app-email-input"), translation),
        setSearchInputText(document.querySelectorAll("app-search-input"), translation),
        setPasswordInputText(document.querySelectorAll("app-password-input"), translation),
        setImageInputTexts(document.querySelectorAll("app-image-input"), translation),
        setTextareaTexts(document.querySelectorAll("app-textarea"), translation),
        setAutocompleteTexts(document.querySelectorAll("app-autocomplete"), translation),
        setLanguageAutocompleteTexts(document.querySelectorAll("app-language-autocomplete"), translation),
        setHeaderTexts(document.querySelectorAll("app-header"), translation)
      ]
  )
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

async function setHeaderTexts(elements: NodeListOf<AppHeader> | AppHeader[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;
  await customElements.whenDefined(definedTag<HeaderTag>("app-header"));
  for (const element of elements)
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
    setIfExists(element, "showingResults", translation.headerShowingResults);
    setIfExists(element, "search", translation.search);
  }
}

async function setLanguageAutocompleteTexts(elements: NodeListOf<AppLanguageAutocomplete> | AppLanguageAutocomplete[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(definedTag<LanguageAutocompleteTag>("app-language-autocomplete"));
  for (const element of elements)
  {
    setIfExists(element, "language", translation.language);
  }
  await setAutocompleteTexts(elements, translation);
}

async function setAutocompleteTexts(elements: NodeListOf<AppAutocomplete<unknown>> | AppAutocomplete<unknown>[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(definedTag<AutocompleteTag>("app-autocomplete"));
  for (const element of elements)
  {
    setIfExists(element, "itemAlreadySelected", translation.autocompleteItemAlreadySelected);
    setIfExists(element, "itemNotFound", translation.autocompleteItemNotFound);
    setIfExists(element, "required", translation.required);
  }
  await setInputTexts(elements, translation);
}

async function setImageInputTexts(elements: NodeListOf<AppImageInput> | AppImageInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(definedTag<ImageInputTag>("app-image-input"));
  for (const element of elements)
  {
    setIfExists(element, "required", translation.required);
    setIfExists(element, "inputMinValidation", translation.imageInputMinSizesValidation);
    setIfExists(element, "inputMaxValidation", translation.imageInputMaxSizesValidation);
    setIfExists(element, "pleaseFillOutThisInput", translation.pleaseFillOutThisInput);
    setIfExists(element, "unsupportedImageType", translation.unsupportedImageType);
    setIfExists(element, "clearImage", translation.clearImage);
    setIfExists(element, "clearImages", translation.clearImages);
  }
}

async function setNumberInputTexts(elements: NodeListOf<AppNumberInput> | AppNumberInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(definedTag<NumberInputTag>("app-number-input"));
  await setInputTexts(elements, translation);
}

async function setEmailInputTexts(elements: NodeListOf<AppEmailInput> | AppEmailInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(definedTag<EmailInputTag>("app-email-input"));
  await setInputTexts(elements, translation);
}

async function setPasswordInputText(elements: NodeListOf<AppPasswordInput> | AppPasswordInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(definedTag<PasswordInputTag>("app-password-input"));
  await setInputTexts(elements, translation);
}

async function setSearchInputText(elements: NodeListOf<AppSearchInput> | AppSearchInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(definedTag<SearchInputTag>("app-search-input"));
  for (const element of elements)
  {
    setIfExists(element, "search", translation.search);
  }
  await setInputTexts(elements, translation);
}

async function setTextareaTexts(elements: NodeListOf<AppTextArea> | AppTextArea[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(definedTag<TextAreaTag>("app-textarea"));
  for (const element of elements)
  {
    setIfExists(element, "pleaseFillOutThisInput", translation.pleaseFillOutThisInput);
    setIfExists(element, "required", translation.required);
    setIfExists(element, "textareaMinValidation", translation.inputMinTextLengthValidation);
    setIfExists(element, "textareaMaxValidation", translation.inputMaxTextLengthValidation);
  }
}

async function setInputTexts(elements: NodeListOf<AppInput> | AppInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(definedTag<InputTag>("app-input"));
  for (const element of elements)
  {
    setIfExists(element, "pleaseFillOutThisInput", translation.pleaseFillOutThisInput);
    setIfExists(element, "required", translation.required);
    setIfExists(element, "inputMinValidation", translation.inputMinTextLengthValidation);
    setIfExists(element, "inputMaxValidation", translation.inputMaxTextLengthValidation);
  }
}

function setIfExists<T extends {
  texts: Observer<U>
}, U extends object>(element: T, key: keyof U, translation: U[keyof U] | null): void
{
  if (translation)
    element.texts.set(key, translation)
}

await main();

function definedTag<T>(value: T): T
{
  return value;
}
