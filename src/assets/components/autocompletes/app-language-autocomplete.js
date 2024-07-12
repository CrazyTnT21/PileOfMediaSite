import {AppAutocomplete} from "./app-autocomplete.js";
import {Language} from "../../classes/language.js";

export class AppLanguageAutocomplete extends AppAutocomplete
{
  connectedCallback()
  {
    this.label = this.label ?? "Language";
    super.connectedCallback();
  }

  async* loadItems()
  {
    return [
      {value: Language.EN},
      {value: Language.DE},
      {value: Language.ES},
      {value: Language.JA},
    ];
  }
}

customElements.define("app-language-autocomplete", AppLanguageAutocomplete);
