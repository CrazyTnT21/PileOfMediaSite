import {AppSearchInput} from "./app-search-input";

export function dataLabelAttr(element: AppSearchInput, value: string | null | undefined): void
{
  if (value == null || value.trim() == "")
    value = element.texts.get("search");

  element.elements.label.innerText = value;
}

export function disabledAttr(element: AppSearchInput, value: string | null | undefined, internals: ElementInternals, hasDisabledFieldset: boolean): void
{
  const disabled = hasDisabledFieldset || value == "";
  const {input} = element.elements;
  input.disabled = disabled;

  if (disabled)
  {
    internals.ariaDisabled = "";
    internals.states.add("disabled")
    element.elements.searchButton.setAttribute("disabled", "");
  }
  else
  {
    internals.ariaDisabled = null;
    internals.states.delete("disabled")
    element.elements.searchButton.removeAttribute("disabled");
  }
}
