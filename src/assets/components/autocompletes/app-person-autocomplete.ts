import {AppAutocomplete} from "./app-autocomplete/app-autocomplete.js";
import {API_URL} from "../../../modules.js";
import {Person} from "../../types/person.js";
import createClient from "openapi-fetch";
import {paths} from "mycollection-openapi";

export class AppPersonAutocomplete extends AppAutocomplete<Person>
{
  override async connectedCallback()
  {
    this.label = this.label ?? "Person";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Person[]>
  {
    const client = createClient<paths>({baseUrl: API_URL});
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await client.GET("/people/name/{name}", {
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

  override async* loadItems(): AsyncGenerator<Person[]>
  {
    const client = createClient<paths>({baseUrl: API_URL});
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await client.GET("/people", {
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
