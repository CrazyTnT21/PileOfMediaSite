import {AppImageInput} from "./app-image-input";
import {logNoValueError} from "../validation/validation";

export function dataMaxFilesizeAttr(_element: AppImageInput, _value: string | null | undefined): void
{
}

export function dataMinFilesizeAttr(_element: AppImageInput, _value: string | null | undefined): void
{
}

export function dataTitleAttr(element: AppImageInput, value: string | null | undefined): void
{
  element.elements.image.title = value ?? "";
}

export function requiredAttr(element: AppImageInput, value: string | null | undefined): void
{
  element.elements.label.setAttribute("data-text-required", element.texts.get("required"));
  element.elements.input.required = value == "";
}

export function dataMultipleAttr(element: AppImageInput, value: string | null | undefined): void
{
  const multiple = value == "";
  element.elements.input.multiple = multiple;

  const {clearImage} = element.elements;
  clearImage.innerText = multiple
      ? element.texts.get("clearImage")
      : element.texts.get("clearImages");
}

export function disabledAttr(element: AppImageInput, value: string | null | undefined, internals: ElementInternals, hasDisabledFieldset: boolean): void
{
  const disabled = hasDisabledFieldset || value == "";
  const input = element.elements.input;
  input.disabled = disabled;
  internals.ariaDisabled = disabled ? "" : null;
}

export function dataLabelAttr(element: AppImageInput, value: string | null | undefined): void
{
  if (value == null || value.trim() == "")
  {
    logNoValueError("label", element.outerHTML);
    value = ""
  }
  element.elements.label.innerText = value;
  element.elements.image.alt = value;
}
