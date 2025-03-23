import {AppAutocomplete} from "./app-autocomplete/app-autocomplete";
import {Genre} from "../../openapi/genre";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../classes/config";
import {apiClient} from "../../openapi/client";

export class AppGenreAutocomplete extends AppAutocomplete<Genre>
{
  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Genre";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Genre[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/genres/name/{name}", {
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

  override async* loadItems(): AsyncGenerator<Genre[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/genres", {
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

  override itemValue(item: Genre): string
  {
    const {translation} = getTranslatedField(item);
    return translation.name
  }

  override itemId(item: Genre): number
  {
    return item.id;
  }

  public static override define(): void
  {
    if (customElements.get("app-genre-autocomplete"))
      return;
    customElements.define("app-genre-autocomplete", AppGenreAutocomplete);
  }
}

AppGenreAutocomplete.define()
