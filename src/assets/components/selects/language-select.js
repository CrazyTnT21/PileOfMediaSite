import {Select} from "./select.js";
import {Language} from "../../classes/language.js";

class LanguageSelect extends Select
{
  constructor()
  {
    super();
  }

  get label()
  {
    return this.getAttribute("data-label") ?? "Language";
  }

  get items()
  {
    return [
      {value: Language.EN, required: true},
      {value: Language.DE},
      {value: Language.ES},
      {value: Language.JA},
    ];
  }
}

customElements.define("app-language-select", LanguageSelect);
