import {AppAutocomplete, appAutocompleteTexts} from "./app-autocomplete/app-autocomplete";
import {Person} from "../../openapi/person";
import {acceptLanguageHeader, logError} from "../../classes/config";
import {apiClient} from "../../openapi/client";
import {Observer} from "../../observer";

export const AppPersonAutocompleteTexts = {
  ...appAutocompleteTexts,
  person: "Person"
}

export class AppPersonAutocomplete extends AppAutocomplete<Person>
{
  override readonly texts = new Observer(AppPersonAutocompleteTexts);

  override async connectedCallback(): Promise<void>
  {
    this.label = this.label || this.texts.get("person");
    await super.connectedCallback();
  }

  constructor()
  {
    super();
    this.texts.addListener("person", (value) => this.label = value);
  }
  override async* searchItems(value: string): AsyncGenerator<Person[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/people/name/{name}", {
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

  override async* loadItems(): AsyncGenerator<Person[]>
  {
    let page = 0;
    const count = 50;
    let total = 51;
    while (page * count < total)
    {
      const {data, error} = await apiClient.GET("/people", {
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
  override itemValue(item: Person): number
  {
    return item.id;
  }

  override itemLabel(item: Person): string
  {
    return item.name;
  }

  public static override define(): void
  {
    if (customElements.get("app-person-autocomplete"))
      return;
    customElements.define("app-person-autocomplete", AppPersonAutocomplete);
  }
}

AppPersonAutocomplete.define();
