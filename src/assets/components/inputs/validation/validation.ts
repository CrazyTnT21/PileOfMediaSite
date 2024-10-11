export function logNoValueError(property: string, outerHtml: string): void
{
  console.error(`No value was given for '${property}' in '${outerHtml}'.`);
}

export function tooShort(input: HTMLInputElement | HTMLTextAreaElement, min: number | null | undefined): boolean
{
  if (min == null)
    return false;
  return input.value.length < min;
}

export function valueMissing(input: HTMLInputElement | HTMLTextAreaElement): boolean
{
  return input.value.trim() === "";
}

export function tooLong(input: HTMLInputElement | HTMLTextAreaElement, max: number | null | undefined): boolean
{
  if (max == null)
    return false;
  return input.value.length > max;
}
