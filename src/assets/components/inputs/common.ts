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
    {
      return fieldset;
    }
  }
  return null;
}

export function handleFieldset(item: Node & {
  set hasDisabledFieldset(value: boolean),
}): void
{
  const parentFieldset = findParentFieldset(item);
  if (parentFieldset)
  {
    if (parentFieldset.disabled)
    {
      item.hasDisabledFieldset = true;
    }
    observeFieldset(parentFieldset, item, disabled =>
    {
      item.hasDisabledFieldset = disabled
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
