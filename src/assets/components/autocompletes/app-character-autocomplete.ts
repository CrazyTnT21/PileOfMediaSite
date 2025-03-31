import {AppAutocomplete, appAutocompleteTexts} from "./app-autocomplete/app-autocomplete";
import {Character} from "../../openapi/character";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../classes/config";
import {apiClient} from "../../openapi/client";
import {Observer} from "../../observer";

export const AppCharacterAutocompleteTexts = {
  ...appAutocompleteTexts,
  character: "Character"
}

export class AppCharacterAutocomplete extends AppAutocomplete<Character>
{
  override readonly texts = new Observer(AppCharacterAutocompleteTexts);

  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || this.texts.get("character");
    await super.connectedCallback();
  }
  constructor()
  {
    super();
    this.texts.addListener("character", (value) => this.label = value);
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

  override itemValue(item: Character): number
  {
    return item.id;
  }

  override itemLabel(item: Character): string
  {
    const {translation} = getTranslatedField(item);
    return translation.name;
  }

  public static override define(): void
  {
    if (customElements.get("app-character-autocomplete"))
      return;
    customElements.define("app-character-autocomplete", AppCharacterAutocomplete);
  }
}

AppCharacterAutocomplete.define();
