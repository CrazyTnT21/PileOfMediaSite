import {AppAutocomplete} from "./app-autocomplete.js";
import {get, join} from "../../scripts/http.js";
import {API_URL} from "../../../modules.js";
import {Genre} from "../../types/genre.js";

export class AppGenreAutocomplete extends AppAutocomplete<Genre>
{
  override async connectedCallback()
  {
    this.label = this.label ?? "Genre";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Genre[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "genres", "name", value), ["page", page.toString()], ["count", count.toString()]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  override async* loadItems()
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "genres"), ["page", page.toString()], ["count", count.toString()]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  override itemValue(item: Genre): string
  {
    return item.name;
  }

  override itemId(item: Genre): number
  {
    return item.id;
  }
}

customElements.define("app-genre-autocomplete", AppGenreAutocomplete);
