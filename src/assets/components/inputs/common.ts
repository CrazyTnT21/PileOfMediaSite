export type AttributeValue = string | null;

export function observeFieldset(fieldset: HTMLFieldSetElement, node: Node, callback: (disabled: boolean) => void): void
{
  const observer = new MutationObserver((mutationList, observer) =>
  {
    if (!fieldset.contains(node))
    {
      observer.disconnect();
      return;
    }
    callback(mutationList[0]!.oldValue != "")
  });
  const config: MutationObserverInit = {attributes: true, attributeFilter: ["disabled"], attributeOldValue: true};

  observer.observe(fieldset, config);
}

export function findParentFieldset(node: Node): HTMLFieldSetElement | null
{
  const fieldsetElements = document.querySelectorAll("fieldset");
  for (const fieldset of fieldsetElements)
  {
    if (fieldset.contains(node))
      return fieldset;
  }
  return null;
}

export function handleFieldset(item: Node, setDisabledFieldsetStatus: (value: boolean) => void): void
{
  const parentFieldset = findParentFieldset(item);
  if (parentFieldset)
  {
    if (parentFieldset.disabled)
      setDisabledFieldsetStatus(true);

    observeFieldset(parentFieldset, item, disabled =>
    {
      setDisabledFieldsetStatus(disabled);
    });
  }
}

export function formData<T>(...values: ([(keyof T) & string, "serialize"] | [string & keyof T])[])
{
  return (body: T): FormData =>
  {
    const formData = new FormData();
    for (const value of values)
    {
      if (body[value[0]] == null)
        continue;
      if (value[1] == "serialize")
      {
        formData.set(value[0], JSON.stringify(body[value[0]]));
        continue;
      }
      const blobData = body[value[0]] as Blob | Blob[];
      if (!Array.isArray(blobData))
      {
        formData.set(value[0], blobData)
        continue;
      }
      formData.delete(value[0]);
      for (const x of blobData)
      {
        formData.append(value[0], x);
      }
    }
    return formData;
  }
}

export function templateString<T extends string>(text: string): T
{
  return text as T;
}

export type SurroundedString<T extends string | number | bigint | boolean | null | undefined> = `${string}${T}${string}`;

export function setOrRemoveAttribute(element: HTMLElement, attribute: string, value: string | null | undefined): void
{
  if (value == null)
  {
    element.removeAttribute(attribute);
    return;
  }
  element.setAttribute(attribute, value);
}

export function setOrRemoveBooleanAttribute(element: HTMLElement, attribute: string, value: boolean): void
{
  if (value)
  {
    element.setAttribute(attribute, "")
    return;
  }
  element.removeAttribute(attribute);
}

export function queryParam<Page extends number, Count extends number>(page: Page, count: Count): {
  query: { page: Page, count: Count }
}
{
  return {query: {page, count}}
}
