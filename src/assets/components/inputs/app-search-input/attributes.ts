import {AppSearchInput} from "./app-search-input";
import {AttributeValue} from "../common";

export function labelAttribute(element: AppSearchInput, value: AttributeValue): void
{
  if (value == null || value.trim() == "")
    value = element.texts.get("search");

  element.elements.label.innerText = value;
}

export function disabledAttribute(element: AppSearchInput, value: AttributeValue): void
{
  const internals = element["internals"];
  const disabled = element.isDisabledByFieldSet || value == "";
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
