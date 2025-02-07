import {AppAutocomplete} from "./app-autocomplete/app-autocomplete";
import {getLanguageCode, Language, LanguageCode} from "../../classes/language";

export type LanguageLabel = { id: number, value: LanguageCode, label: Language };

export class AppLanguageAutocomplete extends AppAutocomplete<LanguageLabel>
{
  override set value(value: LanguageLabel | null | undefined)
  {
    super.value = value;
  }

  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Language";
    await super.connectedCallback();
  }

  readonly #items = [
    {id: 1, ...getLanguageAndCode(Language.EN)},
    {id: 2, ...getLanguageAndCode(Language.DE)},
    {id: 3, ...getLanguageAndCode(Language.ES)},
    {id: 4, ...getLanguageAndCode(Language.JA)},
  ];

  override async* searchItems(): AsyncGenerator<LanguageLabel[]>
  {
    yield this.#items;
  }

  override async* loadItems(): AsyncGenerator<LanguageLabel[]>
  {
    yield this.#items;
  }

  public static define(): void
  {
    if (customElements.get("app-language-autocomplete"))
      return;
    customElements.define("app-language-autocomplete", AppLanguageAutocomplete);
  }
}

AppLanguageAutocomplete.define();

function getLanguageAndCode(language: Language): { label: Language, value: LanguageCode }
{
  return {label: language, value: getLanguageCode(language)}
}
