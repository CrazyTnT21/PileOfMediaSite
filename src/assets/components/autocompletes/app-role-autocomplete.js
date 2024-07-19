import {AppAutocomplete} from "./app-autocomplete.js";
import {get, join} from "../../scripts/http.js";
import {SERVER_URL} from "../../../modules.js";

export class AppRoleAutocomplete extends AppAutocomplete
{
  async connectedCallback()
  {
    this.label = this.label ?? "Role";
    await super.connectedCallback();
  }

  async* searchItems(value)
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(SERVER_URL, "roles", "name", value), [["page", page], ["count", count]]);
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
      const response = await get(join(SERVER_URL, "roles"), [["page", page], ["count", count]]);
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

customElements.define("app-role-autocomplete", AppRoleAutocomplete);
