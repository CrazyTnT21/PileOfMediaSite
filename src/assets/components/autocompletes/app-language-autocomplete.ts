import {AppAutocomplete, appAutocompleteTexts} from "./app-autocomplete/app-autocomplete";
import {LanguageCode, LanguageTexts} from "../../classes/language";
import {Observer} from "../../observer";
import {dataLabelAttr} from "./app-language-autocomplete/attributes";
import {AppInput} from "../inputs/app-input/app-input";
import {AttributeValue} from "../inputs/common";
import {unsafeObjectKeys} from "../../unsafe-object-keys";

export const AppLanguageAutocompleteTexts = {
  ...appAutocompleteTexts,
  language: "Language"
}

export class AppLanguageAutocomplete extends AppAutocomplete<LanguageCode>
{
  override readonly texts = new Observer(AppLanguageAutocompleteTexts);
  static override observedAttributesMap = {
    ...AppAutocomplete.observedAttributesMap,
    "data-label": (element: AppInput, v: AttributeValue): void => dataLabelAttr(element as AppLanguageAutocomplete, v),
  };

  constructor()
  {
    super();
    this.texts.addListener("language", () =>
    {
      if (!this.getAttribute("data-label"))
        this.label = "";
    });
  }

  override async* searchItems(): AsyncGenerator<LanguageCode[]>
  {
    yield items();
  }

  override async* loadItems(): AsyncGenerator<LanguageCode[]>
  {
    yield items();
  }
  override itemValue(item: LanguageCode): any
  {
    return item;
  }

  override itemLabel(item: LanguageCode): string | null
  {
    return LanguageTexts[item];
  }

  public static override define(): void
  {
    if (customElements.get("app-language-autocomplete"))
      return;
    customElements.define("app-language-autocomplete", AppLanguageAutocomplete);
  }

}

function items(): LanguageCode[]
{
  return unsafeObjectKeys(LanguageTexts);
}

AppLanguageAutocomplete.define();
