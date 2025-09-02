import {tooLong, tooShort, valueMissing} from "../validation/validation";
import {AppTextArea} from "./app-textarea";
import {Err, Ok} from "../../../result/result";
import {ErrorResult} from "../../../validation";

export function setValueMissing(element: AppTextArea, input: HTMLTextAreaElement): ErrorResult
{
  if (!isRequired(element) || !valueMissing(input))
    return new Ok(undefined);

  return new Err({state: "valueMissing", userMessage: element.texts.get("pleaseFillOutThisInput")});
}

export function isRequired(element: AppTextArea): boolean
{
  return element.getAttribute("required") === "";
}

export function setMinLength(element: AppTextArea, input: HTMLTextAreaElement): ErrorResult
{
  const min = element.getAttribute("minlength");

  if (!tooShort(input, min ? Number(min) : null))
    return new Ok(undefined);

  const userMessage = element.texts
      .get("textareaMinValidation")
      .replace("{min}", min!.toString())
      .replace("{currentLength}", input.value.length.toString());

  return new Err({state: "tooShort", userMessage})
}

export function setMaxLength(element: AppTextArea, input: HTMLTextAreaElement): ErrorResult
{
  const max = element.getAttribute("maxlength");

  if (!tooLong(input, max ? Number(max) : null))
    return new Ok(undefined);

  const userMessage = element.texts
      .get("textareaMaxValidation")
      .replace("{max}", max!.toString())
      .replace("{currentLength}", input.value.length.toString());

  return new Err({state: "tooLong", userMessage});
}
