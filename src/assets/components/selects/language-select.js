import {Select} from "./select.js";
import {Language} from "../../classes/language.js";

class LanguageSelect extends Select
{
  get label()
  {
    return super.label ?? "Language";
  }

  _items = [
    {value: Language.EN, required: true},
    {value: Language.DE},
    {value: Language.ES},
    {value: Language.JA},
  ];

  get items()
  {
    return this._items;
  }
}

customElements.define("app-language-select", LanguageSelect);
