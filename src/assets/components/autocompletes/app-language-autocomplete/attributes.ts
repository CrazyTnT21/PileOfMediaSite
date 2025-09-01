import {AppLanguageAutocomplete} from "../app-language-autocomplete";
import {AttributeValue} from "../../inputs/common";

export function labelAttribute(element: AppLanguageAutocomplete, value: AttributeValue): void
{
  if (value == null || value.trim() == "")
    value = element.texts.get("language");

  element.elements.label.innerText = value;
}
