export function logNoValueError(property: string, outerHtml: string)
{
  console.error(`No value was given for '${property}' in '${outerHtml}'.`);
}

export function tooShort(input: HTMLInputElement | HTMLTextAreaElement, min: number | null | undefined)
{
  if (min == null)
    return false;
  return !input.value || input.value.length < min;
}

export function valueMissing(input: HTMLInputElement | HTMLTextAreaElement)
{
  return input.value === null || input.value === undefined || input.value === "";
}

export function tooLong(input: HTMLInputElement | HTMLTextAreaElement, max: number | null | undefined)
{
  if (max == null)
    return false;
  return input.value && input.value.length > max;
}
