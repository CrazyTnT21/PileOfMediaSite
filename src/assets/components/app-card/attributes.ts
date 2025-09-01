import {AppCard} from "./app-card";
import {AttributeValue, setOrRemoveAttribute} from "../inputs/common";

export function srcsetAttribute(element: AppCard, value: AttributeValue): void
{
  const {image} = element.elements;
  setOrRemoveAttribute(image, "srcset", value);
}

export function coverAltAttribute(element: AppCard, value: AttributeValue): void
{
  const {image} = element.elements;
  setOrRemoveAttribute(image, "alt", value);
}

export function itemTitleAttribute(element: AppCard, value: AttributeValue): void
{
  const {titleSlot} = element.elements;
  value = value ?? "";
  titleSlot.innerText = value;
}

export function hrefAttribute(element: AppCard, value: AttributeValue): void
{
  const {anchor} = element.elements;
  setOrRemoveAttribute(anchor, "href", value);
}
