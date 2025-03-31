import {AppAutocomplete, appAutocompleteTexts} from "./app-autocomplete/app-autocomplete";
import {Franchise} from "../../openapi/franchise";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../classes/config";
import {apiClient} from "../../openapi/client";
import {Observer} from "../../observer";

export const AppFranchiseAutocompleteTexts = {
  ...appAutocompleteTexts,
  franchise: "Franchise"
}

export class AppFranchiseAutocomplete extends AppAutocomplete<Franchise>
{
  override readonly texts = new Observer(AppFranchiseAutocompleteTexts);

  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || this.texts.get("franchise");
    await super.connectedCallback();
  }

  constructor()
  {
    super();
    this.texts.addListener("franchise", (value) => this.label = value);
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

  override itemValue(item: Franchise): number
  {
    return item.id;
  }

  override itemLabel(item: Franchise): string
  {
    const {translation} = getTranslatedField(item);
    return translation.name;
  }

  public static override define(): void
  {
    if (customElements.get("app-franchise-autocomplete"))
      return;
    customElements.define("app-franchise-autocomplete", AppFranchiseAutocomplete);
  }
}

AppFranchiseAutocomplete.define();
