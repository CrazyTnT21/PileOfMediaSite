import {tooLong, tooShort, valueMissing} from "../validation/validation";
import {AppInput} from "./app-input";

export function setValueMissing(element: AppInput, input: HTMLInputElement): void
{
  if (!isRequired(element) || !valueMissing(input))
    return;

  element.errors.set("valueMissing", () => element.texts.get("valueMissing"));
}

export function isRequired(element: AppInput): boolean
{
  return element.getAttribute("required") === "";
}

export function setMinLength(element: AppInput, input: HTMLInputElement): void
{
  const min = element.getAttribute("minlength");

  if (!tooShort(input, min ? Number(min) : null))
    return
  element.errors.set("tooShort", () => element.texts
      .get("inputMinValidation")
      .replace("{min}", min!.toString())
      .replace("{currentLength}", input.value.length.toString()));
}

export function setMaxLength(element: AppInput, input: HTMLInputElement): void
{
  const max = element.getAttribute("maxlength");

  if (!tooLong(input, max ? Number(max) : null))
    return;

  element.errors.set("tooLong", () => element.texts
      .get("inputMaxValidation")
      .replace("{max}", max!.toString())
      .replace("{currentLength}", input.value.length.toString()));
}
