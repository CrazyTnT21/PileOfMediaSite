import {unsafeObjectKeys} from "../../unsafe-object-keys";

export type AttributeValue = string | null;
export type NonEmptyString = string;

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

export function handleFieldset(item: Node, setParentFieldset: (fieldSet: HTMLFieldSetElement) => void, setDisabledFieldsetStatus: (value: boolean) => void): void
{
  const parentFieldSet = findParentFieldset(item);
  if (!parentFieldSet)
    return;
  setParentFieldset(parentFieldSet);

  if (parentFieldSet.disabled)
    setDisabledFieldsetStatus(true);

  observeFieldset(parentFieldSet, item, disabled =>
  {
    setDisabledFieldsetStatus(disabled);
  });

}

export function formData<T>(...values: { [Key in keyof T]: "serialize" | "binary" }[])
{
  return (body: T): FormData =>
  {
    const formData = new FormData();

    for (const value of values)
    {
      const key = unsafeObjectKeys(value)[0]!;
      const type = value[key];

      if (body[key] == null)
        continue;

      if (type == "serialize")
      {
        formData.set(key, JSON.stringify(body[key]));
        continue;
      }
      const blobData = body[key] as Blob | Blob[];
      if (!Array.isArray(blobData))
      {
        formData.set(key.toString(), blobData)
        continue;
      }
      formData.delete(key.toString());
      for (const x of blobData)
      {
        formData.append(key.toString(), x);
      }
    }
    return formData;
  }
}

export function templateString<T extends string>(text: string): T
{
  return text as T;
}

type TemplateValue = string | number | bigint | boolean | null | undefined;
export type IncludesString<T> = T extends TemplateValue[]
    ? `${string}${TemplateValue}${string}`
    : T extends TemplateValue
        ? `${string}${T}${string}`
        : never;

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

export function randomNumber(): number
{
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0]!;
}
