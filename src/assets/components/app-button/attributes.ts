import {AppButton} from "./app-button";

export function disabledAttr(element: AppButton, value: string | null | undefined, internals: ElementInternals, hasDisabledFieldset: boolean): void
{
  const disabled = hasDisabledFieldset || value == "";
  const {button} = element.elements;
  button.disabled = disabled;

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

export function typeAttr(element: AppButton, value: string | null | undefined): void
{
  const {button} = element.elements;
  button.type = value as "button" | "reset" | "submit";
}
