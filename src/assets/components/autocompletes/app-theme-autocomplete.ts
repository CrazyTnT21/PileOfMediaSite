import {AppAutocomplete} from "./app-autocomplete/app-autocomplete";
import {Theme} from "../../openapi/theme";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../classes/config";
import {apiClient} from "../../openapi/client";

export class AppThemeAutocomplete extends AppAutocomplete<Theme>
{
  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Theme";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Theme[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/themes/name/{name}", {
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
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/themes", {
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

  public static override define(): void
  {
    if (customElements.get("app-theme-autocomplete"))
      return;
    customElements.define("app-theme-autocomplete", AppThemeAutocomplete);
  }
}

AppThemeAutocomplete.define();
