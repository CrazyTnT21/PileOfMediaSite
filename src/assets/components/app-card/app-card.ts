import {applyStyleSheet, attach} from "../defaults";
import {ApplyStyleSheet} from "../apply-style-sheet";
import {StyleCSS} from "../style-css";
import html from "./app-card.html" with {type: "inline"}
import css from "./app-card.css" with {type: "inline"}

type attributeKey = keyof typeof AppCard["observedAttributesMap"];

export class AppCard extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  override shadowRoot: ShadowRoot;

  private static readonly observedAttributesMap = {
    "data-srcset": AppCard.dataSrcSetAttr,
    "data-alt": AppCard.dataAltAttr,
    "data-title": AppCard.dataTitleAttr,
    "data-link": AppCard.dataLink
  }
  static readonly observedAttributes = <[attributeKey]>Object.keys(AppCard.observedAttributesMap);

  async attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppCard.observedAttributesMap[name as attributeKey]!;
    callback(this, newValue);
  }

  private static dataSrcSetAttr(element: AppCard, value: string | null | undefined): void
  {
    const image = element.shadowRoot.querySelector("img")!;
    if (value == null)
      image.removeAttribute("srcset");
    else
      image.setAttribute("srcset", value);
  }

  get srcSet(): string | null
  {
    return this.getAttribute("data-srcset")
  }

  set srcSet(value: string | null)
  {
    if (value == null)
      this.removeAttribute("data-srcset")
    else
      this.setAttribute("data-srcset", value);
  }

  private static dataAltAttr(element: AppCard, value: string | null | undefined): void
  {
    const image = element.shadowRoot.querySelector("img")!;
    if (value == null)
      image.removeAttribute("alt");
    else
      image.setAttribute("alt", value);
  }

  get alt(): string | null
  {
    return this.getAttribute("data-alt")
  }

  set alt(value: string | null)
  {
    if (value == null)
      this.removeAttribute("data-alt")
    else
      this.setAttribute("data-alt", value);
  }

  private static dataLink(element: AppCard, value: string | null | undefined): void
  {
    const anchor = element.shadowRoot.querySelector("a")!;
    if (value == null)
      anchor.removeAttribute("href");
    else
      anchor.setAttribute("href", value);
  }

  get link(): string | null
  {
    return this.getAttribute("data-link")
  }

  set link(value: string | null)
  {
    if (value == null)
      this.removeAttribute("data-link")
    else
      this.setAttribute("data-link", value);
  }

  private static dataTitleAttr(element: AppCard, value: string | null | undefined): void
  {
    const titleSlot: HTMLSlotElement = element.shadowRoot.querySelector("[name='title']")!;
    value = value ?? "";
    titleSlot.innerText = value;
  }

  get titleText(): string | null
  {
    return this.getAttribute("data-title")
  }

  set titleText(value: string | null)
  {
    if (value == null)
      this.removeAttribute("data-title")
    else
      this.setAttribute("data-title", value);
  }

  constructor()
  {
    super();
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
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
