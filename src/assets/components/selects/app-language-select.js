import {AppSelect} from "./app-select.js";
import {Language} from "../../classes/language.js";

export class AppLanguageSelect extends AppSelect
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

customElements.define("app-language-select", AppLanguageSelect);
