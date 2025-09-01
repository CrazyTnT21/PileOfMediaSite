import {AppPasswordInput} from "./app-password-input";
import {AttributeValue} from "../common";

export function disabledAttribute(element: AppPasswordInput, value: AttributeValue): void
{
  const internals = element["internals"]
  const disabled = element.isDisabledByFieldSet || value == "";
  const {input} = element.elements;
  input.disabled = disabled;

  if (disabled)
  {
    internals.ariaDisabled = "";
    internals.states.add("disabled")
    element.elements.passwordButton.setAttribute("disabled", "");
  }
  else
  {
    internals.ariaDisabled = null;
    internals.states.delete("disabled")
    element.elements.passwordButton.removeAttribute("disabled");
  }
}
