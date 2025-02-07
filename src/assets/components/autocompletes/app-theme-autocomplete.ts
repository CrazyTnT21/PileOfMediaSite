import {AppAutocomplete} from "./app-autocomplete/app-autocomplete";
import {API_URL} from "../../scripts/modules";
import {Theme} from "../../openapi/theme";
import createClient from "openapi-fetch";
import {paths} from "pileofmedia-openapi";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../classes/config";

export class AppThemeAutocomplete extends AppAutocomplete<Theme>
{
  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Theme";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Theme[]>
  {
    const client = createClient<paths>({baseUrl: API_URL});
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await client.GET("/themes/name/{name}", {
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

  override async* loadItems(): AsyncGenerator<Theme[]>
  {
    const client = createClient<paths>({baseUrl: API_URL});
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await client.GET("/themes", {
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

  override itemValue(item: Theme): string
  {
    const {translation} = getTranslatedField(item);
    return translation.name
  }

  override itemId(item: Theme): number
  {
    return item.id;
  }
}

customElements.define("app-theme-autocomplete", AppThemeAutocomplete);
