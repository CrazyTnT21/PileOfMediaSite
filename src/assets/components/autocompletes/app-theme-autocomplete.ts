import {AppAutocomplete} from "./app-autocomplete.js";
import {get, join} from "../../scripts/http.js";
import {API_URL} from "../../../modules.js";
import {Theme} from "../../types/theme.js";

export class AppThemeAutocomplete extends AppAutocomplete<Theme>
{
  override async connectedCallback()
  {
    this.label = this.label ?? "Theme";
    await super.connectedCallback();
  }

  override async* searchItems(value: string):  AsyncGenerator<Theme[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "themes", "name", value), ["page", page.toString()], ["count", count.toString()]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  override async* loadItems(): AsyncGenerator<Theme[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "themes"), ["page", page.toString()], ["count", count.toString()]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  override itemValue(item: Theme): string
  {
    return item.name;
  }

  override itemId(item: Theme): number
  {
    return item.id;
  }
}

customElements.define("app-theme-autocomplete", AppThemeAutocomplete);
