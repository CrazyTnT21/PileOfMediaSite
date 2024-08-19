
export function logNoValueError(property, outerHtml)
{
  console.error(`No value was given for '${property}' in '${outerHtml}'.`);
}

export function tooShort(input, min)
{
  if (!min)
    return false;
  return !input.value || input.value.length < Number(min);
}

export function valueMissing(input)
{
  return input.value === null || input.value === undefined || input.value === "";
}

export function tooLong(input, max)
{
  if (!max)
    return false;
  return input.value && input.value.length > Number(max);
}