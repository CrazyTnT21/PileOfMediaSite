import {AppImageInput} from "../app-image-input";
import {AttributeValue} from "../../inputs/common";
import {logNoValueError} from "../../inputs/validation/validation";

export type AttributeKey = keyof typeof observedAttributesMap;
export const observedAttributesMap = Object.freeze({
  "label": labelAttribute,
  "required": requiredAttribute,
  "disabled": (element: AppImageInput, value: AttributeValue): void => disabledAttribute(element, value),
  "max-filesize": maxFilesizeAttribute,
  "min-filesize": minFilesizeAttribute,
  "image-title": imageTitleAttribute,
  "multiple": multipleAttribute
});

export function maxFilesizeAttribute(_element: AppImageInput, _value: AttributeValue): void
{
}

export function minFilesizeAttribute(_element: AppImageInput, _value: AttributeValue): void
{
}

export function imageTitleAttribute(element: AppImageInput, value: AttributeValue): void
{
  element["elements"].images.title = value ?? "";
}

export function requiredAttribute(element: AppImageInput, value: AttributeValue): void
{
  element["elements"].label.setAttribute("data-text-required", element.texts.get("required"));
  element["elements"].input.required = value == "";
}

export function multipleAttribute(element: AppImageInput, value: AttributeValue): void
{
  element["elements"].input.multiple = value == "";
  element["elements"].carousel.hidden = value != "";
}

export function disabledAttribute(element: AppImageInput, value: AttributeValue): void
{
  const internals = element["internals"];
  const disabled = element.isDisabledByFieldSet || value == "";
  const {input, removeImage} = element["elements"];
  input.disabled = disabled;
  removeImage.disabled = disabled;

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
  element["elements"].label.innerText = value;
}
