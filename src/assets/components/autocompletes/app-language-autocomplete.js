import {AppAutocomplete} from "./app-autocomplete.js";
import {Language} from "../../classes/language.js";

export class AppLanguageAutocomplete extends AppAutocomplete
{
  async connectedCallback()
  {
    this.label = this.label ?? "Language";
    await super.connectedCallback();
  }

  async* loadItems()
  {
    return [
      {id: 1, value: Language.EN},
      {id: 2, value: Language.DE},
      {id: 3, value: Language.ES},
      {id: 4, value: Language.JA},
    ];
  }
}

customElements.define("app-language-autocomplete", AppLanguageAutocomplete);
