import {AppAutocomplete, appAutocompleteTexts} from "./app-autocomplete/app-autocomplete";
import {LanguageCode, LanguageTexts} from "../../language";
import {Observer} from "../../observer";
import {labelAttribute} from "./app-language-autocomplete/attributes";
import {AppInput} from "../inputs/app-input/app-input";
import {AttributeValue} from "../inputs/common";
import {unsafeObjectKeys} from "../../unsafe-object-keys";

export const AppLanguageAutocompleteTexts = {
  ...appAutocompleteTexts,
  language: "Language"
}

const languageAutocompleteTag = "app-language-autocomplete" as const;
export type LanguageAutocompleteTag = typeof languageAutocompleteTag;

export class AppLanguageAutocomplete extends AppAutocomplete<LanguageCode>
{
  public override readonly texts = new Observer(AppLanguageAutocompleteTexts);
  protected static override observedAttributesMap = {
    ...AppAutocomplete.observedAttributesMap,
    "label": (element: AppInput, v: AttributeValue): void => labelAttribute(element as AppLanguageAutocomplete, v),
  };

  public constructor()
  {
    super();
    this.texts.addListener("language", () =>
    {
      if (!this.getAttribute("label"))
        this.label = "";
    });
  }

  public override async* searchItems(): AsyncGenerator<LanguageCode[]>
  {
    yield items();
  }

  protected override async* loadItems(): AsyncGenerator<LanguageCode[]>
  {
    yield items();
  }

  public override itemValue(item: LanguageCode): any
  {
    return item;
  }

  public override itemLabel(item: LanguageCode): string | null
  {
    return LanguageTexts[item];
  }

  public static override define(): void
  {
    if (customElements.get(languageAutocompleteTag))
      return;
    customElements.define(languageAutocompleteTag, AppLanguageAutocomplete);
  }

}

function items(): LanguageCode[]
{
  return unsafeObjectKeys(LanguageTexts);
}

AppLanguageAutocomplete.define();
