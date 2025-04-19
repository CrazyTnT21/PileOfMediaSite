import {AppLanguageAutocomplete} from "../app-language-autocomplete";

export function dataLabelAttr(element: AppLanguageAutocomplete, value: string | null | undefined): void
{
  if (value == null || value.trim() == "")
    value = element.texts.get("language");

  element.elements.label.innerText = value;
}
