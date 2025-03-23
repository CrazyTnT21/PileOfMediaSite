import {applyStyleSheet, attach} from "../defaults";
import {ApplyStyleSheet} from "../apply-style-sheet";
import {StyleCSS} from "../style-css";
import html from "./app-card.html" with {type: "inline"}
import css from "./app-card.css" with {type: "inline"}
import {mapSelectors} from "../../dom";
import {dataAltAttr, dataLink, dataSrcSetAttr, dataTitleAttr} from "./attributes";
import {setOrRemoveAttribute} from "../inputs/common";

type attributeKey = keyof typeof AppCard["observedAttributesMap"];

export type AppCardElements = {
  image: HTMLImageElement,
  anchor: HTMLAnchorElement,
  titleSlot: HTMLSlotElement
};

export class AppCard extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  override shadowRoot: ShadowRoot;
  readonly elements: AppCardElements;
  protected static readonly elementSelectors: { [key in keyof AppCard["elements"]]: string } = {
    image: "img",
    anchor: "a",
    titleSlot: "[name='title']"
  }

  private static readonly observedAttributesMap = {
    "data-srcset": dataSrcSetAttr,
    "data-alt": dataAltAttr,
    "data-title": dataTitleAttr,
    "data-link": dataLink
  }
  static readonly observedAttributes = <[attributeKey]>Object.keys(AppCard.observedAttributesMap);

  async attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppCard.observedAttributesMap[name as attributeKey]!;
    callback(this, newValue);
  }

  get srcSet(): string | null
  {
    return this.getAttribute("data-srcset")
  }

  set srcSet(value: string | null)
  {
    setOrRemoveAttribute(this, "data-srcset", value);
  }

  get alt(): string | null
  {
    return this.getAttribute("data-alt")
  }

  set alt(value: string | null)
  {
    setOrRemoveAttribute(this, "data-srcset", value);
  }

  get link(): string | null
  {
    return this.getAttribute("data-link")
  }

  set link(value: string | null)
  {
    setOrRemoveAttribute(this, "data-link", value);
  }

  get titleText(): string | null
  {
    return this.getAttribute("data-title")
  }

  set titleText(value: string | null)
  {
    setOrRemoveAttribute(this, "data-title", value);
  }

  constructor()
  {
    super();
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
    this.elements = mapSelectors<AppCardElements>(this.shadowRoot, AppCard.elementSelectors);
  }

  attach = attach;
  applyStyleSheet = applyStyleSheet;

  render(): void
  {
    this.shadowRoot.innerHTML = html;
  }

  styleCSS(): string
  {
    return css;
  }

  public static define(): void
  {
    if (customElements.get("app-card"))
      return;
    customElements.define("app-card", AppCard);
  }
}

AppCard.define()
