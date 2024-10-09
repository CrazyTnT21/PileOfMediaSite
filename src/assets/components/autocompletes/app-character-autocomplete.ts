import {AppAutocomplete} from "./app-autocomplete/app-autocomplete.js";
import {get, join} from "../../scripts/http.js";
import {API_URL} from "../../../modules.js";
import {Character} from "../../types/character.js";

export class AppCharacterAutocomplete extends AppAutocomplete<Character>
{
  override async connectedCallback()
  {
    this.label = this.label ?? "Character";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Character[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "characters", "name", value), ["page", page.toString()], ["count", count.toString()]);
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
      const response = await get(join(API_URL, "characters"), ["page", page.toString()], ["count", count.toString()]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  override itemValue(item: Character): string
  {
    return item.name;
  }

  override itemId(item: Character): number
  {
    return item.id;
  }
}

customElements.define("app-character-autocomplete", AppCharacterAutocomplete);
