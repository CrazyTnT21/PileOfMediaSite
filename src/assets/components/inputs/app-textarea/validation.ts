import {tooLong, tooShort, valueMissing} from "../validation/validation";
import {AppTextArea} from "./app-textarea";

export function setValueMissing(element: AppTextArea, textarea: HTMLTextAreaElement): void
{
  if (!isRequired(element) || !valueMissing(textarea))
    return;

  element.errors.set("valueMissing", () => element.texts.get("valueMissing"));
}

export function isRequired(element: AppTextArea): boolean
{
  return element.getAttribute("required") === "";
}

export function setMinLength(element: AppTextArea, textarea: HTMLTextAreaElement): void
{
  const min = element.getAttribute("minlength");

  if (!tooShort(textarea, min ? Number(min) : null))
    return
  element.errors.set("tooShort", () => element.texts
      .get("textareaMinValidation")
      .replace("{min}", min!.toString())
      .replace("{currentLength}", textarea.value.length.toString()));
}

export function setMaxLength(element: AppTextArea, textarea: HTMLTextAreaElement): void
{
  const max = element.getAttribute("maxlength");

  if (!tooLong(textarea, max ? Number(max) : null))
    return;

  element.errors.set("tooLong", () => element.texts
      .get("textareaMaxValidation")
      .replace("{max}", max!.toString())
      .replace("{currentLength}", textarea.value.length.toString()));
}
