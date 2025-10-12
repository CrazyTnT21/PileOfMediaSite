import {unsafeObjectKeys} from "../../unsafe-object-keys";
import {Observer} from "../../observer";
import {Err, Ok, Result} from "../../result/result";

export type AttributeValue = string | null;
export type NonEmptyString = string;
export type NonEmptyArray<T> = [T, ...T[]];

export function observeFieldset(fieldset: HTMLFieldSetElement, node: Node, callback: (disabled: boolean) => void): void
{
  const observer = new MutationObserver((mutationList, observer) =>
  {
    if (!fieldset.contains(node))
    {
      observer.disconnect();
      return;
    }
    callback(indexArray(mutationList, 0).unwrap().oldValue != "")
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

export function formData<T>(values: { [Key in keyof T]: "serialize" | "binary" })
{
  return (body: T): FormData =>
  {
    const formData = new FormData();
    const keys = unsafeObjectKeys(values);

    for (const key of keys)
    {
      const type = values[key];

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
  return indexArray(array, 0).unwrap();
}

export function matchNestedTexts<InitialTexts extends object, NestedTexts>(initialTexts: Observer<InitialTexts>, nestedTexts: Observer<ObserverValue<InitialTexts, NestedTexts> & SameKeys<InitialTexts, NestedTexts>>): void
{
  const keys = unsafeObjectKeys(nestedTexts.object())
  for (const key of keys)
  {
    initialTexts.addListener(key as any, (value) => nestedTexts.set(key, value));
  }
}

type ObserverValue<InitialTexts, NestedTexts> = Omit<InitialTexts, keyof Omit<InitialTexts, keyof NestedTexts>>;
type SameKeys<InitialTexts, NestedTexts> = keyof Omit<NestedTexts, keyof InitialTexts> extends never ? NestedTexts : never;

export function setOrDeleteState(states: CustomStateSet, key: string, value: boolean): void
{
  if (value)
  {
    states.add(key)
    return;
  }
  states.delete(key)
}

export function indexArray<Index extends number, T>(array: ArrayLike<T>, index: Index): Result<T, {
  outOfBounds: Index,
  length: number
}>
{
  if (index < 0 || index >= array.length)
    return new Err({outOfBounds: index, length: array.length});
  return new Ok(array[index]!);
}
