import {logNoValueError} from "../validation/validation";
import {AppTextArea} from "./app-textarea";

export function dataLabelAttr(element: AppTextArea, value: string | null | undefined): void
{
  if (value == null || value.trim() == "")
  {
    logNoValueError("label", element.outerHTML);
    value = ""
  }
  element.elements.label.innerText = value;
}

export function placeholderAttr(element: AppTextArea, value: string | null | undefined): void
{
  element.elements.textarea.placeholder = value ?? "";
}

export function disabledAttr(element: AppTextArea, value: string | null | undefined, internals: ElementInternals, hasDisabledFieldset: boolean): void
{
  const disabled = hasDisabledFieldset || value == "";
  const {textarea} = element.elements;
  textarea.disabled = disabled;
  internals.ariaDisabled = disabled ? "" : null;
}

export function maxLengthAttr(element: AppTextArea, value: string | null | undefined): void
{
  const {textarea} = element.elements;
  if (value == null)
  {
    textarea.removeAttribute("maxlength");
    return;
  }
  textarea.setAttribute("maxlength", value);
}

export function minlengthAttr(element: AppTextArea, value: string | null | undefined): void
{
  const {textarea} = element.elements;
  if (value == null)
  {
    textarea.removeAttribute("minlength");
    return;
  }
  textarea.setAttribute("minlength", value);
}

export function requiredAttr(element: AppTextArea, value: string | null | undefined): void
{
  element.elements.textarea.required = value == "";
  element.elements.label.setAttribute("data-text-required", element.texts.get("required"));
}

export function rowsAttr(element: AppTextArea, value: string | null | undefined): void
{
  const {textarea} = element.elements;
  if (value == null)
    textarea.removeAttribute("rows");
  else
    textarea.setAttribute("rows", value.toString());
}
