import {AppAutocomplete} from "./app-autocomplete.js";
import {get, join} from "../../scripts/http.js";
import {API_URL} from "../../../modules.js";
import {Franchise} from "../../types/franchise.js";

export class AppFranchiseAutocomplete extends AppAutocomplete<Franchise>
{
  override async connectedCallback()
  {
    this.label = this.label ?? "Franchise";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Franchise[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "franchises", "name", value), ["page", page.toString()], ["count", count.toString()]);
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
      const response = await get(join(API_URL, "franchises"), ["page", page.toString()], ["count", count.toString()]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  override itemValue(item: Franchise): string
  {
    return item.name;
  }

  override itemId(item: Franchise): number
  {
    return item.id;
  }
}

customElements.define("app-franchise-autocomplete", AppFranchiseAutocomplete);
