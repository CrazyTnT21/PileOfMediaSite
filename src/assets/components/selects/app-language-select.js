import {AppSelect} from "./app-select.js";
import {Language} from "../../classes/language.js";

export class AppLanguageSelect extends AppSelect
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

customElements.define("app-language-select", AppLanguageSelect);
