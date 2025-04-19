import {logNoValueError} from "../validation/validation";
import {AppInput} from "./app-input";
import {AttributeValue, setOrRemoveAttribute} from "../common";

export function dataLabelAttr(element: AppInput, value: AttributeValue): void
{
  if (value == null || value.trim() == "")
  {
    logNoValueError("label", element.outerHTML);
    value = ""
  }
  element.elements.label.innerText = value;
}

export function placeholderAttr(element: AppInput, value: string | null | undefined): void
{
  element.elements.input.placeholder = value ?? "";
}

export function disabledAttr(element: AppInput, value: string | null | undefined, internals: ElementInternals, hasDisabledFieldset: boolean): void
{
  const disabled = hasDisabledFieldset || value == "";
  const {input} = element.elements;
  input.disabled = disabled;
  internals.ariaDisabled = disabled ? "" : null;
}

export function maxLengthAttr(element: AppInput, value: string | null | undefined): void
{
  const {input} = element.elements;
  setOrRemoveAttribute(input, "maxlength", value);
}

export function minlengthAttr(element: AppInput, value: string | null | undefined): void
{
  const {input} = element.elements;
  setOrRemoveAttribute(input, "minlength", value);
}

export function requiredAttr(element: AppInput, value: string | null | undefined): void
{
  element.elements.label.setAttribute("data-text-required", element.texts.get("required"));
  element.elements.input.required = value == "";
}
