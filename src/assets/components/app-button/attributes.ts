import {AppButton} from "./app-button";

export function disabledAttr(element: AppButton, value: string | null | undefined, internals: ElementInternals, hasDisabledFieldset: boolean): void
{
  const disabled = hasDisabledFieldset || value == "";
  const {button} = element.elements;
  button.disabled = disabled;
  internals.ariaDisabled = disabled ? "" : null;
}

export function typeAttr(element: AppButton, value: string | null | undefined): void
{
  const {button} = element.elements;
  button.type = value as "button" | "reset" | "submit";
}
