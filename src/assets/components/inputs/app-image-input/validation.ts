import {Kilobyte} from "../../../units/kilobyte";
import {AppImageInput} from "./app-image-input";


export function setUnsupportedType(element: AppImageInput): void
{
  if (!unsupportedImageType(element.elements.input))
    return;

  element.errors.set("customError", () => element.texts.get("unsupportedImageType"));
}

export function setMaxFileSize(element: AppImageInput): void
{
  const {input} = element.elements;
  const max = element.maxFilesize;
  if (!fileTooBig(input, max))
    return;
  const fileSizes = [...input.files!].map(x => Kilobyte.fromByte(x.size).toString()).join(", ");
  element.errors.set("customError", () => element.texts.get("inputMaxValidation").replace("{max}", max!.toString()).replace("{fileSizes}", fileSizes));
}

export function setMinFileSize(element: AppImageInput): void
{
  const min = element.minFilesize;

  const {input} = element.elements;
  if (!fileTooSmall(input, min))
    return;

  const fileSizes = [...input.files!].map(x => Kilobyte.fromByte(x.size).toString()).join(", ");
  element.errors.set("customError", () => element.texts.get("inputMinValidation").replace("{min}", min!.toString()).replace("{fileSizes}", fileSizes));
}

export function setValueMissing(element: AppImageInput): void
{
  const {input} = element.elements;
  if (!isRequired(element) || !valueMissing(input))
    return;

  element.errors.set("valueMissing", () => element.texts.get("valueMissing"));
}

function isRequired(element: AppImageInput): boolean
{
  return element.getAttribute("required") === "";
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

function valueMissing(element: HTMLInputElement): boolean
{
  return element.files!.length === 0;
}
