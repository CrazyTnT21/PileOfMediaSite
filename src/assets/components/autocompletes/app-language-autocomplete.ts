import {AppAutocomplete, appAutocompleteTexts} from "./app-autocomplete/app-autocomplete";
import {getLanguageCode, Language, LanguageCode} from "../../classes/language";
import {Observer} from "../../observer";

export type LanguageLabel = { value: LanguageCode, label: Language };

export const AppLanguageAutocompleteTexts = {
  ...appAutocompleteTexts,
  language: "Language"
}

export class AppLanguageAutocomplete extends AppAutocomplete<LanguageLabel>
{
  override readonly texts = new Observer(AppLanguageAutocompleteTexts);

  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || this.texts.get("language");
    await super.connectedCallback();
  }

  constructor()
  {
    super();
    this.texts.addListener("language", (value) => this.label = value);
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
