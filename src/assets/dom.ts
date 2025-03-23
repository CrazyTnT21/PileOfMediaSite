/**
 * Maps selectors to their corresponding Element
 * @example
 *
 * type Elements = { input: HTMLInputElement, label: HTMLLabelElement, };
 * const selectors = {input: "input", label: "#label"};
 * const result = mapSelectors<Elements>(document, selectors);
 * result.input.value = "Value";
 * result.container.innerText = "" // Property `container` does not exist on type;
 */
export function mapSelectors<Elements>(element: ParentNode, selectors: { [key in keyof Elements]: string }): { [key in keyof Elements]: Elements[key] }
{
  const result = {};
  const keys = <(keyof typeof selectors)[]>Object.keys(selectors);
  for (const key of keys)
  {
    if (selectors[key])
      Object.defineProperty(result, key, {value: element.querySelector(selectors[key])!});
  }
  return <{ [key in keyof Elements]: Elements[key] }>result;
}
