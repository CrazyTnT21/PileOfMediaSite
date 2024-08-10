import {AppAutocomplete} from "./app-autocomplete.js";
import {get, join} from "../../scripts/http.js";
import {API_URL} from "../../../modules.js";

export class AppThemeAutocomplete extends AppAutocomplete
{
  async connectedCallback()
  {
    this.label = this.label ?? "Theme";
    await super.connectedCallback();
  }

  async* searchItems(value)
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "themes", "name", value), [["page", page], ["count", count]]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  async* loadItems()
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "themes"), [["page", page], ["count", count]]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  itemValue(item)
  {
    return item.name;
  }

  itemId(item)
  {
    return item.id;
  }
}

customElements.define("app-theme-autocomplete", AppThemeAutocomplete);
