import {AppImageInput} from "./app-image-input";
import {logNoValueError} from "../validation/validation";
import {AttributeValue} from "../common";

export function maxFilesizeAttribute(_element: AppImageInput, _value: AttributeValue): void
{
}

export function minFilesizeAttribute(_element: AppImageInput, _value: AttributeValue): void
{
}

export function imageTitleAttribute(element: AppImageInput, value: AttributeValue): void
{
  element.elements.image.title = value ?? "";
}

export function requiredAttribute(element: AppImageInput, value: AttributeValue): void
{
  element.elements.label.setAttribute("data-text-required", element.texts.get("required"));
  element.elements.input.required = value == "";
}

export function multipleAttribute(element: AppImageInput, value: AttributeValue): void
{
  const multiple = value == "";
  element.elements.input.multiple = multiple;

  const {clearImage} = element.elements;
  clearImage.innerText = multiple
      ? element.texts.get("clearImage")
      : element.texts.get("clearImages");
}

export function disabledAttribute(element: AppImageInput, value: AttributeValue): void
{
  const internals = element["internals"];
  const disabled = element.isDisabledByFieldSet || value == "";
  const input = element.elements.input;
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

export function labelAttribute(element: AppImageInput, value: AttributeValue): void
{
  if (value == null || value.trim() == "")
  {
    logNoValueError("label", element.outerHTML);
    value = ""
  }
  element.elements.label.innerText = value;
  element.elements.image.alt = value;
}
