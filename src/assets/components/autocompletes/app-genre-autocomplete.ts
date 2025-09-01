import {AppAutocomplete, appAutocompleteTexts} from "./app-autocomplete/app-autocomplete";
import {Genre} from "../../openapi/genre";
import {acceptLanguageHeader, getTranslatedField, logError} from "../../config";
import {apiClient} from "../../openapi/client";
import {Observer} from "../../observer";

export const AppGenreAutocompleteTexts = {
  ...appAutocompleteTexts,
  genre: "Genre"
}

export class AppGenreAutocomplete extends AppAutocomplete<Genre>
{
  public override readonly texts = new Observer(AppGenreAutocompleteTexts);

  public constructor()
  {
    super();
    this.texts.addListener("genre", (value) => this.label = value);
  }

  /**
   * Called each time the element is added to the document.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)
   */
  protected override async connectedCallback(): Promise<void>
  {
    this.label = this.label || this.texts.get("genre");
    await super.connectedCallback();
  }

  public override async* searchItems(value: string): AsyncGenerator<Genre[]>
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

  protected override async* loadItems(): AsyncGenerator<Genre[]>
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

  public override itemValue(item: Genre): number
  {
    return item.id;
  }

  public override itemLabel(item: Genre): string
  {
    const {translation} = getTranslatedField(item);
    return translation.name;
  }

  public static override define(): void
  {
    if (customElements.get("app-genre-autocomplete"))
      return;
    customElements.define("app-genre-autocomplete", AppGenreAutocomplete);
  }
}

AppGenreAutocomplete.define()
