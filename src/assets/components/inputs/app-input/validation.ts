import {tooLong, tooShort, valueMissing} from "../validation/validation";
import {AppInput} from "./app-input";
import {Err, Ok} from "../../../result/result";
import {ErrorResult} from "../../../validation";

export function setValueMissing(element: AppInput, input: HTMLInputElement): ErrorResult
{
  if (!isRequired(element) || !valueMissing(input))
    return new Ok(undefined);

  return new Err({state: "valueMissing", userMessage: element.texts.get("pleaseFillOutThisInput")});
}

export function isRequired(element: AppInput): boolean
{
  return element.getAttribute("required") === "";
}

export function setMinLength(element: AppInput, input: HTMLInputElement): ErrorResult
{
  const min = element.getAttribute("minlength");

  if (!tooShort(input, min ? Number(min) : null))
    return new Ok(undefined);
  const userMessage = element.texts
      .get("inputMinValidation")
      .replace("{min}", min!.toString())
      .replace("{currentLength}", input.value.length.toString());

  return new Err({state: "tooShort", userMessage})
}

export function setMaxLength(element: AppInput, input: HTMLInputElement): ErrorResult
{
  const max = element.getAttribute("maxlength");

  if (!tooLong(input, max ? Number(max) : null))
    return new Ok(undefined);

  const userMessage = element.texts
      .get("inputMaxValidation")
      .replace("{max}", max!.toString())
      .replace("{currentLength}", input.value.length.toString());

  return new Err({state: "tooLong", userMessage});
}
