import {AppLanguageAutocomplete} from "../app-language-autocomplete";

export function labelAttribute(element: AppLanguageAutocomplete, value: string | null | undefined): void
{
  if (value == null || value.trim() == "")
    value = element.texts.get("language");

  element.elements.label.innerText = value;
}
