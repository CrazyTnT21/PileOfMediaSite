import {AppCard} from "./app-card";
import {setOrRemoveAttribute} from "../inputs/common";

export function dataSrcSetAttr(element: AppCard, value: string | null | undefined): void
{
  const {image} = element.elements;
  setOrRemoveAttribute(image, "srcset", value);
}

export function dataAltAttr(element: AppCard, value: string | null | undefined): void
{
  const {image} = element.elements;
  setOrRemoveAttribute(image, "alt", value);
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
  setOrRemoveAttribute(anchor, "href", value);
}
