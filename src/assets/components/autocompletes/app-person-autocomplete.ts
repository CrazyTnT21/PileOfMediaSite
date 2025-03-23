import {AppAutocomplete} from "./app-autocomplete/app-autocomplete";
import {Person} from "../../openapi/person";
import {acceptLanguageHeader, logError} from "../../classes/config";
import {apiClient} from "../../openapi/client";

export class AppPersonAutocomplete extends AppAutocomplete<Person>
{
  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Person";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Person[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/people/name/{name}", {
        params: {
          path: {name: value},
          query: {page, count},
          header: {...acceptLanguageHeader()}
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

  override async* loadItems(): AsyncGenerator<Person[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/people", {
        params: {
          query: {page, count},
          header: {...acceptLanguageHeader()}
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

  override itemValue(item: Person): string
  {
    return item.name;
  }

  override itemId(item: Person): number
  {
    return item.id;
  }

  public static override define(): void
  {
    if (customElements.get("app-person-autocomplete"))
      return;
    customElements.define("app-person-autocomplete", AppPersonAutocomplete);
  }
}

AppPersonAutocomplete.define();
