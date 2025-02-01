import {AppAutocomplete} from "./app-autocomplete/app-autocomplete.js";
import {API_URL} from "../../scripts/modules";
import {Franchise} from "../../openapi/franchise";
import createClient from "openapi-fetch";
import {paths} from "pileofmedia-openapi";
import {Config, logError} from "../../classes/config";

export class AppFranchiseAutocomplete extends AppAutocomplete<Franchise>
{
  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Franchise";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Franchise[]>
  {
    const client = createClient<paths>({baseUrl: API_URL});
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await client.GET("/franchises/name/{name}", {
        params: {
          path: {name: value},
          query: {page, count},
          header: {"Accept-Language": Config.languageTag}
        }
      });
      if (data == undefined)
      {
        logError(new Error(error))
        return [];
      }
      page++;
      total = data.total;
      yield data.items;
    }
  }

  override async* loadItems(): AsyncGenerator<Franchise[]>
  {
    const client = createClient<paths>({baseUrl: API_URL});
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await client.GET("/franchises", {
        params: {
          query: {page, count},
          header: {"Accept-Language": Config.languageTag}
        }
      });
      if (data == undefined)
      {
        logError(new Error(error))
        return [];
      }
      page++;
      total = data.total;
      yield data.items;
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
