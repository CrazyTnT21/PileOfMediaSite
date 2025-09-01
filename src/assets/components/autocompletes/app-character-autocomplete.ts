import {AppAutocomplete, appAutocompleteTexts} from "./app-autocomplete/app-autocomplete";
import {Character} from "../../openapi/character";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../config";
import {apiClient} from "../../openapi/client";
import {Observer} from "../../observer";

export const AppCharacterAutocompleteTexts = {
  ...appAutocompleteTexts,
  character: "Character"
}

export class AppCharacterAutocomplete extends AppAutocomplete<Character>
{
  public override readonly texts = new Observer(AppCharacterAutocompleteTexts);

  public constructor()
  {
    super();
    this.texts.addListener("character", (value) => this.label = value);
  }

  /**
   * Called each time the element is added to the document.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)
   */
  protected override async connectedCallback(): Promise<void>
  {
    this.label = this.label || this.texts.get("character");
    await super.connectedCallback();
  }

  public override async* searchItems(value: string): AsyncGenerator<Character[]>
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

  protected override async* loadItems(): AsyncGenerator<Character[]>
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

  public override itemValue(item: Character): number
  {
    return item.id;
  }

  public override itemLabel(item: Character): string
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
