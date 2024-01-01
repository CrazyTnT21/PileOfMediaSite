import {Select} from "/assets/components/select.js";

class GenreSelect extends Select
{
  get title()
  {
    return "Genres";
  }

  get items()
  {
    return GenreSelect._items;
  }

  static _items = [{value: "Horror"}, {value: "Mystery"}, {value: "Fantasy"}, {value: "Adventure"}];
  static loading = false;

  async connectedCallback()
  {
    super.connectedCallback();
    if (!GenreSelect._items.length > 0 && !GenreSelect.loading)
      await this.loadItems();
  }

  constructor()
  {
    super();
  }

  async loadItems()
  {
    GenreSelect.loading = true;
    // GenreSelect._items =   await get(Config.serverUrl + "/Genres");
    //  this.createOptions(GenreSelect._items);
    GenreSelect.loading = false;
  }
}

customElements.define("app-genre-select", GenreSelect);
