import {AppImageInput} from "../app-image-input";
import {ErrorResult} from "../../../validation";
import {Err, Ok} from "../../../result/result";
import {Kilobyte} from "../../../units/kilobyte";

export function setupValidation(self: AppImageInput): void
{
  const {input} = self["elements"];
  self["internals"].setFormValue(input.value);
  self.addCustomError(() => setValueMissing(self));
  self.addCustomError(() => setMaxFileSize(self));
  self.addCustomError(() => setMinFileSize(self));
  self.addCustomError(() => setUnsupportedType(self));
}

function setUnsupportedType(element: AppImageInput): ErrorResult
{
  if (!unsupportedImageType(element["elements"].input))
    return new Ok(undefined);

  return new Err({
    state: "customError",
    userMessage: element.texts.get("unsupportedImageType")
  });
}

function unsupportedImageType(element: HTMLInputElement): boolean
{
  for (const file of element.files!)
  {
    if (!file.type.includes("image"))
      return true;
  }
  return false;
}

function setMaxFileSize(element: AppImageInput): ErrorResult
{
  const {input} = element["elements"];
  const max = element.maxFilesize;
  if (!fileTooBig(input, max))
    return new Ok(undefined);
  const fileSizes = [...input.files!].map(x => Kilobyte.fromByte(x.size).toString()).join(", ");
  return new Err({
    state: "customError",
    userMessage: element.texts.get("inputMaxValidation").replace("{max}", max!.toString()).replace("{fileSizes}", fileSizes)
  });
}

function fileTooBig(element: HTMLInputElement, max: Kilobyte | undefined | null): boolean
{
  if (!max)
    return false;

  for (const file of element.files!)
  {
    if (Kilobyte.fromByte(file.size).more(max))
      return true;
  }
  return false;
}

function setMinFileSize(element: AppImageInput): ErrorResult
{
  const min = element.minFilesize;

  const {input} = element["elements"];
  if (!fileTooSmall(input, min))
    return new Ok(undefined);

  const fileSizes = [...input.files!].map(x => Kilobyte.fromByte(x.size).toString()).join(", ");
  return new Err({
    state: "customError",
    userMessage: element.texts.get("inputMinValidation").replace("{min}", min!.toString()).replace("{fileSizes}", fileSizes)
  });
}

function fileTooSmall(element: HTMLInputElement, min: Kilobyte | undefined | null): boolean
{
  if (!min)
    return false;

  for (const file of element.files!)
  {
    if (Kilobyte.fromByte(file.size).less(min))
      return true;
  }
  return false;
}

function setValueMissing(element: AppImageInput): ErrorResult
{
  const {input} = element["elements"];
  if (!isRequired(element) || !valueMissing(input))
    return new Ok(undefined);

  return new Err({state: "valueMissing", userMessage: element.texts.get("pleaseFillOutThisInput")});
}

function isRequired(element: AppImageInput): boolean
{
  return element.getAttribute("required") === "";
}

function valueMissing(element: HTMLInputElement): boolean
{
  return element.files!.length === 0;
}

export function collectValidationMessages(self: AppImageInput): Map<keyof ValidityStateFlags, string>
{
  const validityMessages: Map<keyof ValidityStateFlags, string> = new Map();
  for (const [_, errorEntry] of self["errors"])
  {
    const {error} = errorEntry();
    if (error)
    {
      validityMessages.set(error.state, error.userMessage);
    }
  }
  return validityMessages
}
