import {logNoValueError} from "../inputs/validation/validation";
import {AppCheckbox} from "./app-checkbox";

export function dataLabelAttr(element: AppCheckbox, value: string | null | undefined): void
{
  if (value == null || value.trim() == "")
  {
    logNoValueError("label", element.outerHTML);
    value = ""
  }
  element.elements.label.innerText = value;
}

export function disabledAttr(element: AppCheckbox, value: string | null | undefined, internals: ElementInternals, hasDisabledFieldset: boolean): void
{
  const {input} = element.elements;
  const disabled = hasDisabledFieldset || value == "";
  input.disabled = disabled;
  internals.ariaDisabled = disabled ? "" : null;
}
