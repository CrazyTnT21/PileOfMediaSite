import {logNoValueError} from "../validation/validation";
import {AppInput} from "./app-input";
import {AttributeValue, setOrRemoveAttribute} from "../common";

export function dataLabelAttribute(element: AppInput, value: AttributeValue): void
{
  if (value == null || value.trim() == "")
  {
    logNoValueError("label", element.outerHTML);
    value = ""
  }
  element.elements.label.innerText = value;
}

export function placeholderAttribute(element: AppInput, value: string | null | undefined): void
{
  element.elements.input.placeholder = value ?? "";
}

export function disabledAttribute(element: AppInput, value: string | null | undefined, internals: ElementInternals, hasDisabledFieldset: boolean): void
{
  const disabled = hasDisabledFieldset || value == "";
  const {input} = element.elements;
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

export function maxLengthAttribute(element: AppInput, value: string | null | undefined): void
{
  const {input} = element.elements;
  setOrRemoveAttribute(input, "maxlength", value);
}

export function minlengthAttribute(element: AppInput, value: string | null | undefined): void
{
  const {input} = element.elements;
  setOrRemoveAttribute(input, "minlength", value);
}

export function requiredAttribute(element: AppInput, value: string | null | undefined): void
{
  element.elements.label.setAttribute("data-text-required", element.texts.get("required"));
  element.elements.input.required = value == "";
}
