import {AppButton} from "./app-button";

export function disabledAttribute(element: AppButton, value: string | null | undefined, internals: ElementInternals, hasDisabledFieldset: boolean): void
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

export function typeAttribute(element: AppButton, value: string | null | undefined): void
{
  const {button} = element.elements;
  const validType = value && ["submit", "button", "reset"].includes(value);
  if (validType)
    button.type = value as "button" | "submit" | "reset"
  else
    button.type = "submit";
}
