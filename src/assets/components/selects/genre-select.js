import {Select} from "./select.js";

class GenreSelect extends Select
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
    // GenreSelect._items =   await get(Config.serverUrl + "/Genres");
    //  this.createOptions(GenreSelect._items);
  }
}

customElements.define("app-genre-select", GenreSelect);
