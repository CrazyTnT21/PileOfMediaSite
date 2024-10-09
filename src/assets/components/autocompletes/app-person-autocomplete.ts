import {AppAutocomplete} from "./app-autocomplete/app-autocomplete.js";
import {get, join} from "../../scripts/http.js";
import {API_URL} from "../../../modules.js";
import {Person} from "../../types/person.js";

export class AppPersonAutocomplete extends AppAutocomplete<Person>
{
  override async connectedCallback()
  {
    this.label = this.label ?? "Person";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Person[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "people", "name", value), ["page", page.toString()], ["count", count.toString()]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  override async* loadItems(): AsyncGenerator<Person[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "people"), ["page", page.toString()], ["count", count.toString()]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  override itemValue(item: Person): string
  {
    return item.name;
  }

  override itemId(item: Person): number
  {
    return item.id;
  }
}

customElements.define("app-person-autocomplete", AppPersonAutocomplete);
