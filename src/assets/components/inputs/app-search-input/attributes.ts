import {AppSearchInput} from "./app-search-input";

export function dataLabelAttr(element: AppSearchInput, value: string | null | undefined): void
{
  if (value == null || value.trim() == "")
    value = element.texts.get("search");

  element.elements.label.innerText = value;
}
