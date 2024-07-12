import {AppAutocomplete} from "./app-autocomplete.js";
import {get, join} from "../../scripts/http.js";
import {SERVER_URL} from "../../../modules.js";

class AppCharacterAutocomplete extends AppAutocomplete
{
  connectedCallback()
  {
    this.label = this.label ?? "Character";
    super.connectedCallback();
  }

  async* searchItems(value)
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(SERVER_URL, "characters", "name", value), [["page", page], ["count", count]]);
      page++;
      total = response.total;
      response.items.forEach(x => x.value = x.name);
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
      const response = await get(join(SERVER_URL, "characters"), [["page", page], ["count", count]]);
      page++;
      total = response.total;
      response.items.forEach(x => x.value = x.name);
      yield response.items;
    }
  }
}

customElements.define("app-character-autocomplete", AppCharacterAutocomplete);
