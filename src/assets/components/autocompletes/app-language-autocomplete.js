import {AppAutocomplete} from "./app-autocomplete.js";
import {Language} from "../../classes/language.js";

export class AppLanguageAutocomplete extends AppAutocomplete
{
  set value(value)
  {
    if (!value)
    {
      super.value = value;
      return;
    }

    let language = Language[value];
    if (language)
    {
      language = {value: language};
    }
    else
    {
      console.error(`Language '${value}' does not exist`);
      language = {label: Language.EN, value: "EN"};
    }
    super.value = language;
  }

  async connectedCallback()
  {
    this.label = this.label ?? "Language";
    await super.connectedCallback();
  }

  #items = [
    {id: 1, label: Language.EN, value: "EN"},
    {id: 2, label: Language.DE, value: "DE"},
    {id: 3, label: Language.ES, value: "ES"},
    {id: 4, label: Language.JA, value: "JA"},
  ];

  async* searchItems()
  {
    return this.#items;
  }

  async* loadItems()
  {
    return this.#items;
  }
}

customElements.define("app-language-autocomplete", AppLanguageAutocomplete);
