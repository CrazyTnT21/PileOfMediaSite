import {Config} from "../config";
import {Translation} from "../i18n/translation";
import type {AppInput, InputTag} from "assets/components/inputs/app-input/app-input";
import {Observer} from "../observer";
import type {AppNumberInput, NumberInputTag} from "../components/inputs/app-number-input/app-number-input";
import type {AppImageInput, ImageInputTag} from "../components/app-image-input/app-image-input";
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
import {LanguageCodes} from "../i18n/language";

async function main(): Promise<void>
{
  const elements = <NodeListOf<HTMLElement>>document.querySelectorAll("[data-translate]");
  const language = Config.preferredLanguages[0];
  document.querySelector("html")!.lang = LanguageCodes[language].toLowerCase();
  const translation: Translation = await getPreferredTranslation();
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

export async function setHeaderTexts(elements: NodeListOf<AppHeader> | AppHeader[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;
  await customElements.whenDefined(genericValue<HeaderTag>("app-header"));
  setFromObject(elements, {
    books: translation.books,
    graphicNovels: translation.graphicNovels,
    movies: translation.movies,
    shows: translation.shows,
    games: translation.games,
    profile: translation.profile,
    friends: translation.friends,
    comments: translation.comments,
    reviews: translation.reviews,
    settings: translation.settings,
    preferences: translation.preferences,
    logout: translation.logout,
    login: translation.login,
    showingResults: translation.headerShowingResults,
    search: translation.search,
    required: translation.required,
    pleaseFillOutThisInput: translation.pleaseFillOutThisInput,
    inputMinValidation: translation.inputMinTextLengthValidation,
    inputMaxValidation: translation.inputMaxTextLengthValidation
  });
}

export async function setLanguageAutocompleteTexts(elements: NodeListOf<AppLanguageAutocomplete> | AppLanguageAutocomplete[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(genericValue<LanguageAutocompleteTag>("app-language-autocomplete"));
  setFromObject(elements, {
    language: translation.language,
    itemNotFound: null,
    itemAlreadySelected: null,
    required: null,
    pleaseFillOutThisInput: null,
    inputMinValidation: null,
    inputMaxValidation: null
  });

  await setAutocompleteTexts(elements, translation);
}

export async function setAutocompleteTexts(elements: NodeListOf<AppAutocomplete<unknown>> | AppAutocomplete<unknown>[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(genericValue<AutocompleteTag>("app-autocomplete"));
  setFromObject(elements, {
    itemAlreadySelected: translation.autocompleteItemAlreadySelected,
    itemNotFound: translation.autocompleteItemNotFound,
    required: null,
    pleaseFillOutThisInput: null,
    inputMinValidation: null,
    inputMaxValidation: null
  });

  await setInputTexts(elements, translation);
}

export async function setImageInputTexts(elements: NodeListOf<AppImageInput> | AppImageInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(genericValue<ImageInputTag>("app-image-input"));
  setFromObject(elements, {
    required: translation.required,
    inputMinValidation: translation.imageInputMinSizesValidation,
    inputMaxValidation: translation.imageInputMaxSizesValidation,
    pleaseFillOutThisInput: translation.pleaseFillOutThisInput,
    unsupportedImageType: translation.unsupportedImageType,
    removeImage: translation.removeImage,
    uploadImages: translation.uploadImages,
    filename: translation.filename
  });
}

export async function setNumberInputTexts(elements: NodeListOf<AppNumberInput> | AppNumberInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(genericValue<NumberInputTag>("app-number-input"));
  setFromObject(elements, {
    required: null,
    pleaseFillOutThisInput: null,
    inputMinValidation: null,
    inputMaxValidation: null
  });
  await setInputTexts(elements, translation);
}

export async function setEmailInputTexts(elements: NodeListOf<AppEmailInput> | AppEmailInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(genericValue<EmailInputTag>("app-email-input"));
  setFromObject(elements, {
    required: null,
    pleaseFillOutThisInput: null,
    inputMinValidation: null,
    inputMaxValidation: null
  });
  await setInputTexts(elements, translation);
}

export async function setPasswordInputText(elements: NodeListOf<AppPasswordInput> | AppPasswordInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(genericValue<PasswordInputTag>("app-password-input"));
  setFromObject(elements, {
    required: null,
    pleaseFillOutThisInput: null,
    inputMinValidation: null,
    inputMaxValidation: null
  });
  await setInputTexts(elements, translation);
}

export async function setSearchInputText(elements: NodeListOf<AppSearchInput> | AppSearchInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(genericValue<SearchInputTag>("app-search-input"));
  setFromObject(elements, {
    search: translation.search,
    required: null,
    pleaseFillOutThisInput: null,
    inputMinValidation: null,
    inputMaxValidation: null
  });
  await setInputTexts(elements, translation);
}

export async function setTextareaTexts(elements: NodeListOf<AppTextArea> | AppTextArea[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(genericValue<TextAreaTag>("app-textarea"));
  setFromObject(elements, {
    required: translation.required,
    pleaseFillOutThisInput: translation.pleaseFillOutThisInput,
    textareaMinValidation: translation.inputMinTextLengthValidation,
    textareaMaxValidation: translation.inputMaxTextLengthValidation
  });
}

export async function setInputTexts(elements: NodeListOf<AppInput> | AppInput[], translation: Translation): Promise<void>
{
  if (elements.length == 0)
    return;

  await customElements.whenDefined(genericValue<InputTag>("app-input"));
  setFromObject(elements, {
    required: translation.required,
    pleaseFillOutThisInput: translation.pleaseFillOutThisInput,
    inputMinValidation: translation.inputMinTextLengthValidation,
    inputMaxValidation: translation.inputMaxTextLengthValidation
  });
}

function setFromObject<T extends { texts: Observer<any> }>(
  elements: Iterable<T>,
  object: { [key in keyof ReturnType<T["texts"]["object"]>]: string | null | undefined }
): void
{
  const keys = Object.keys(object);
  for (const key of keys)
  {
    if (object[key] == null || object[key] == undefined)
      continue;

    for (const element of elements)
    {
      const value = object[key];
      element.texts.set(key, value)
    }
  }
}

async function getPreferredTranslation(): Promise<Translation>
{
  for (const languageCode of Config.preferredLanguages)
  {
    const localeId = LanguageCodes[languageCode].toLowerCase();
    const response = await fetch(`/assets/i18n/translations/${localeId}.json`);

    if (response.status >= 500 && response.status < 600)
      throw new Error(response.statusText, {cause: response});

    if (response.status == 404)
      continue;

    return await response.json();
  }
  return await (await fetch(`/assets/i18n/translations/en.json`)).json();
}

await main();

function genericValue<T>(value: T): T
{
  return value;
}
