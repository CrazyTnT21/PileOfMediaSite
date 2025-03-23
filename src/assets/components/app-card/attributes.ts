import {AppCard} from "./app-card";

export function dataSrcSetAttr(element: AppCard, value: string | null | undefined): void
{
  const {image} = element.elements;
  if (value == null)
  {
    image.removeAttribute("srcset");
    return;
  }
  image.setAttribute("srcset", value);
}

export function dataAltAttr(element: AppCard, value: string | null | undefined): void
{
  const {image} = element.elements;
  if (value == null)
  {
    image.removeAttribute("alt");
    return;
  }
  image.setAttribute("alt", value);
}

export function dataTitleAttr(element: AppCard, value: string | null | undefined): void
{
  const {titleSlot} = element.elements;
  value = value ?? "";
  titleSlot.innerText = value;
}

export function dataLink(element: AppCard, value: string | null | undefined): void
{
  const {anchor} = element.elements;
  if (value == null)
  {
    anchor.removeAttribute("href");
    return;
  }
  anchor.setAttribute("href", value);
}
