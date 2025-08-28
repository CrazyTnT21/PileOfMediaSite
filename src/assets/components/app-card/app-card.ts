import {applyStyleSheet, attach} from "../defaults";
import {StyleCSS} from "../style-css";
import html from "./app-card.html" with {type: "inline"}
import css from "./app-card.css" with {type: "inline"}
import {mapSelectors} from "../../dom";
import {dataAltAttribute, dataLink, dataSrcSetAttribute, dataTitleAttribute} from "./attributes";
import {mapStringAttribute} from "../inputs/map-boolean-attribute";

type attributeKey = keyof typeof AppCard["observedAttributesMap"];

export type AppCardElements = {
  image: HTMLImageElement,
  anchor: HTMLAnchorElement,
  titleSlot: HTMLSlotElement
};

export class AppCard extends HTMLElement implements StyleCSS
{
  override shadowRoot: ShadowRoot;
  readonly elements: AppCardElements;
  protected static readonly elementSelectors: { [key in keyof AppCard["elements"]]: string } = {
    image: "img",
    anchor: "a",
    titleSlot: "[name='title']"
  }

  private static readonly observedAttributesMap = {
    "data-srcset": dataSrcSetAttribute,
    "data-alt": dataAltAttribute,
    "data-title": dataTitleAttribute,
    "data-link": dataLink
  }
  static readonly observedAttributes = Object.keys(AppCard.observedAttributesMap);

  async attributeChangedCallback(name: attributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppCard.observedAttributesMap[name];
    callback(this, newValue);
  }

  @mapStringAttribute("data-srcset")
  accessor srcset: string | null | undefined;

  @mapStringAttribute("data-alt")
  accessor alt: string | null | undefined;

  @mapStringAttribute("data-link")
  accessor link: string | null | undefined;

  @mapStringAttribute("data-title")
  accessor titleText: string | null | undefined;

  constructor()
  {
    super();
    this.shadowRoot = attach(this);
    this.render();
    this.elements = mapSelectors<AppCardElements>(this.shadowRoot, AppCard.elementSelectors);
  }

  render(): void
  {
    this.shadowRoot.innerHTML = html;
    applyStyleSheet(this.shadowRoot, this.styleCSS());
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
