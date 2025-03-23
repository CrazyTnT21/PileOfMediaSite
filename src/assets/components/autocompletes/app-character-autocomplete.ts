import {AppAutocomplete} from "./app-autocomplete/app-autocomplete";
import {Character} from "../../openapi/character";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../classes/config";
import {apiClient} from "../../openapi/client";

export class AppCharacterAutocomplete extends AppAutocomplete<Character>
{
  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || "Character";
    await super.connectedCallback();
  }

  override async* searchItems(value: string): AsyncGenerator<Character[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/characters/name/{name}", {
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

  override async* loadItems(): AsyncGenerator<Character[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/characters", {
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

  override itemValue(item: Character): string
  {
    const {translation} = getTranslatedField(item);
    return translation.name
  }

  override itemId(item: Character): number
  {
    return item.id;
  }

  public static override define(): void
  {
    if (customElements.get("app-character-autocomplete"))
      return;
    customElements.define("app-character-autocomplete", AppCharacterAutocomplete);
  }
}

AppCharacterAutocomplete.define();
