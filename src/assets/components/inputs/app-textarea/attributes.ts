import {logNoValueError} from "../validation/validation";
import {AppTextArea} from "./app-textarea";
import {AttributeValue, setOrRemoveAttribute} from "../common";

export function labelAttribute(element: AppTextArea, value: AttributeValue): void
{
  if (value == null || value.trim() == "")
  {
    logNoValueError("label", element.outerHTML);
    value = ""
  }
  element["elements"].label.innerText = value;
}

export function placeholderAttribute(element: AppTextArea, value: AttributeValue): void
{
  element["elements"].textarea.placeholder = value ?? "";
}

export function disabledAttribute(element: AppTextArea, value: AttributeValue): void
{
  const internals = element["internals"];
  const disabled = element.isDisabledByFieldSet || value == "";
  const {textarea} = element["elements"];
  textarea.disabled = disabled;

  if (disabled)
  {
    internals.ariaDisabled = "";
    internals.states.add("disabled");
  }
  else
  {
    internals.ariaDisabled = null;
    internals.states.delete("disabled")
  }
}

export function maxLengthAttribute(element: AppTextArea, value: AttributeValue): void
{
  const {textarea} = element["elements"];
  setOrRemoveAttribute(textarea, "maxlength", value);
}

export function minlengthAttribute(element: AppTextArea, value: AttributeValue): void
{
  const {textarea} = element["elements"];
  setOrRemoveAttribute(textarea, "minlength", value);
}

export function requiredAttribute(element: AppTextArea, value: AttributeValue): void
{
  element["elements"].textarea.required = value == "";
  element["elements"].label.setAttribute("data-text-required", element.texts.get("required"));
}

export function rowsAttribute(element: AppTextArea, value: AttributeValue): void
{
  const {textarea} = element["elements"];
  setOrRemoveAttribute(textarea, "rows", value);
}
