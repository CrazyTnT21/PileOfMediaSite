import {AppSelect} from "./app-select.js";

class AppGenreSelect extends AppSelect
{
  get label()
  {
    return super.label ?? "Genres";
  }

  get items()
  {
    return this._items;
  }

  _items = [
    {value: "Horror"},
    {value: "Mystery"},
    {value: "Fantasy"},
    {value: "Adventure"},
  ];

  async connectedCallback()
  {
    super.connectedCallback();
    await this.loadItems();
  }

  async loadItems()
  {
    // AppGenreSelect._items =   await get(Config.serverUrl + "/Genres");
    //  this.createOptions(AppGenreSelect._items);
  }
}

customElements.define("app-genre-select", AppGenreSelect);
