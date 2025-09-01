import {logNoValueError} from "../inputs/validation/validation";
import {AppCheckbox} from "./app-checkbox";
import {AttributeValue} from "../inputs/common";

export function labelAttribute(element: AppCheckbox, value: AttributeValue): void
{
  if (value == null || value.trim() == "")
  {
    logNoValueError("label", element.outerHTML);
    value = ""
  }
  element.elements.label.innerText = value;
}

export function disabledAttribute(element: AppCheckbox, value: AttributeValue): void
{
  const internals = element["internals"];
  const {input} = element.elements;
  const disabled = element.isDisabledByFieldSet || value == "";
  input.disabled = disabled;

  if (disabled)
  {
    internals.ariaDisabled = "";
    internals.states.add("disabled")
  }
  else
  {
    internals.ariaDisabled = null;
    internals.states.delete("disabled")
  }
}
