import {AppAutocomplete} from "./app-autocomplete/app-autocomplete";
import {Franchise} from "../../openapi/franchise";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../classes/config";
import {apiClient} from "../../openapi/client";

export class AppFranchiseAutocomplete extends AppAutocomplete<Franchise>
{
  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Franchise";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Franchise[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/franchises/name/{name}", {
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

  override async* loadItems(): AsyncGenerator<Franchise[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/franchises", {
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

  override itemValue(item: Franchise): string
  {
    const {translation} = getTranslatedField(item);
    return translation.name
  }

  override itemId(item: Franchise): number
  {
    return item.id;
  }

  public static override define(): void
  {
    if (customElements.get("app-franchise-autocomplete"))
      return;
    customElements.define("app-franchise-autocomplete", AppFranchiseAutocomplete);
  }
}

AppFranchiseAutocomplete.define();
