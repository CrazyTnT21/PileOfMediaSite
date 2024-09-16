import {AppAutocomplete} from "./app-autocomplete.js";
import {get, join} from "../../scripts/http.js";
import {API_URL} from "../../../modules.js";
import {Role} from "../../types/role.js";

export class AppRoleAutocomplete extends AppAutocomplete<Role>
{
  override async connectedCallback()
  {
    this.label = this.label ?? "Role";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Role[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "roles", "name", value), ["page", page.toString()], ["count", count.toString()]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  override async* loadItems(): AsyncGenerator<Role[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(API_URL, "roles"), ["page", page.toString()], ["count", count.toString()]);
      page++;
      total = response.total;
      yield response.items;
    }
  }

  override itemValue(item: Role): string
  {
    return item.name;
  }

  override itemId(item: Role): number
  {
    return item.id;
  }
}

customElements.define("app-role-autocomplete", AppRoleAutocomplete);
