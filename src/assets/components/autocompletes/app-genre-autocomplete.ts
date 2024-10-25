import {AppAutocomplete} from "./app-autocomplete/app-autocomplete.js";
import {API_URL} from "../../scripts/modules";
import {Genre} from "../../types/genre.js";
import createClient from "openapi-fetch";
import {paths} from "mycollection-openapi";

export class AppGenreAutocomplete extends AppAutocomplete<Genre>
{
  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Genre";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Genre[]>
  {
    const client = createClient<paths>({baseUrl: API_URL});
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await client.GET("/genres/name/{name}", {
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

  override async* loadItems(): AsyncGenerator<Genre[]>
  {
    const client = createClient<paths>({baseUrl: API_URL});
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await client.GET("/genres", {
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
