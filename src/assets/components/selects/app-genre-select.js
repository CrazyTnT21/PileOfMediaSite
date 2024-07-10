import {AppSelect} from "./app-select.js";
import {get, join} from "../../scripts/http.js";
import {SERVER_URL} from "../../../modules.js";

class AppGenreSelect extends AppSelect
{
  connectedCallback()
  {
    this.label = this.label ?? "Genres";
    super.connectedCallback();
  }

  async* searchItems(value)
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(SERVER_URL, "genres", "name", value), [["page", page], ["count", count]]);
      page++;
      total = response.total;
      yield  response.items.map(x => ({value: x.name}));
    }
  }

  async* loadItems()
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const response = await get(join(SERVER_URL, "genres"), [["page", page], ["count", count]]);
      page++;
      total = response.total;
      yield  response.items.map(x => ({value: x.name}));
    }
  }
}

customElements.define("app-genre-select", AppGenreSelect);
