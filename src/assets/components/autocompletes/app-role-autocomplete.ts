import {AppAutocomplete} from "./app-autocomplete/app-autocomplete";
import {Role} from "../../openapi/role";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../classes/config";
import {apiClient} from "../../openapi/client";

export class AppRoleAutocomplete extends AppAutocomplete<Role>
{
  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Role";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Role[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/roles/name/{name}", {
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

  override async* loadItems(): AsyncGenerator<Role[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/roles", {
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

  override itemValue(item: Role): string
  {
    const {translation} = getTranslatedField(item);
    return translation.name;
  }

  override itemId(item: Role): number
  {
    return item.id;
  }

  public static override define(): void
  {
    if (customElements.get("app-role-autocomplete"))
      return;
    customElements.define("app-role-autocomplete", AppRoleAutocomplete);
  }
}

AppRoleAutocomplete.define();
