import {AppAutocomplete, appAutocompleteTexts} from "./app-autocomplete/app-autocomplete";
import {getLanguageCode, Language, LanguageCode} from "../../classes/language";
import {Observer} from "../../observer";
import {dataLabelAttr} from "./app-language-autocomplete/attributes";
import {AppInput} from "../inputs/app-input/app-input";
import {AttributeValue} from "../inputs/common";

export type LanguageLabel = { value: LanguageCode, label: Language };

export const AppLanguageAutocompleteTexts = {
  ...appAutocompleteTexts,
  language: "Language"
}

export class AppLanguageAutocomplete extends AppAutocomplete<LanguageLabel>
{
  override readonly texts = new Observer(AppLanguageAutocompleteTexts);
  static override observedAttributesMap = {
    ...AppAutocomplete.observedAttributesMap,
    "data-label": (element: AppInput, v: AttributeValue): void => dataLabelAttr(element as AppLanguageAutocomplete, v),
  };

  constructor()
  {
    super();
    this.texts.addListener("language", () =>
    {
      if (!this.getAttribute("data-label"))
        this.label = "";
    });
  }

  override async* searchItems(): AsyncGenerator<LanguageLabel[]>
  {
    yield items();
  }

  override async* loadItems(): AsyncGenerator<LanguageLabel[]>
  {
    yield items();
  }

  public static override define(): void
  {
    if (customElements.get("app-language-autocomplete"))
      return;
    customElements.define("app-language-autocomplete", AppLanguageAutocomplete);
  }
}

function getLanguageAndCode(language: Language): LanguageLabel
{
  return {label: language, value: getLanguageCode(language)}
}

function items(): LanguageLabel[]
{
  return [
    {...getLanguageAndCode(Language.EN)},
    {...getLanguageAndCode(Language.DE)},
    {...getLanguageAndCode(Language.ES)},
    {...getLanguageAndCode(Language.JA)},
  ]
}

AppLanguageAutocomplete.define();
