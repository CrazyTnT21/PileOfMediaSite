import {AppAutocomplete} from "./app-autocomplete/app-autocomplete.js";
import {API_URL} from "../../../modules.js";
import {Character} from "../../types/character.js";
import createClient from "openapi-fetch";
import {paths} from "mycollection-openapi";

export class AppCharacterAutocomplete extends AppAutocomplete<Character>
{
  override async connectedCallback()
  {
    this.label = this.label ?? "Character";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Character[]>
  {
    const client = createClient<paths>({baseUrl: API_URL});
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await client.GET("/characters/name/{name}", {
        params: {
          path: {name: value},
          query: {page, count}
        }
      });
      if (data == undefined)
      {
        console.error(error)
        return [];
      }
      page++;
      total = data.total;
      yield data.items;
    }
  }

  override async* loadItems(): AsyncGenerator<Character[]>
  {
    const client = createClient<paths>({baseUrl: API_URL});
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await client.GET("/characters", {
        params: {
          query: {page, count}
        }
      });
      if (data == undefined)
      {
        console.error(error)
        return [];
      }
      page++;
      total = data.total;
      yield data.items;
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
