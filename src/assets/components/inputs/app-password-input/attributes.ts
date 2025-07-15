import {AppPasswordInput} from "./app-password-input";

export function disabledAttr(element: AppPasswordInput, value: string | null | undefined, internals: ElementInternals, hasDisabledFieldset: boolean): void
{
  const disabled = hasDisabledFieldset || value == "";
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
