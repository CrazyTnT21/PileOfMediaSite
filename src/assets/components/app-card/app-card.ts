import {applyStyleSheet, attach} from "../defaults";
import {StyleCSS} from "../style-css";
import html from "./app-card.html" with {type: "inline"}
import css from "./app-card.css" with {type: "inline"}
import {mapSelectors} from "../../dom";
import {coverAltAttribute, hrefAttribute, srcsetAttribute, itemTitleAttribute} from "./attributes";
import {mapStringAttribute} from "../inputs/map-boolean-attribute";

type AttributeKey = keyof typeof AppCard["observedAttributesMap"];

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
    "srcset": srcsetAttribute,
    "cover-alt": coverAltAttribute,
    "item-title": itemTitleAttribute,
    "href": hrefAttribute
  }
  static readonly observedAttributes = Object.keys(AppCard.observedAttributesMap);

  async attributeChangedCallback(name: AttributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppCard.observedAttributesMap[name];
    callback(this, newValue);
  }

  @mapStringAttribute("srcset")
  accessor srcset: string | null | undefined;

  @mapStringAttribute("cover-alt")
  accessor coverAlt: string | null | undefined;

  @mapStringAttribute("href")
  accessor href: string | null | undefined;

  @mapStringAttribute("item-title")
  accessor itemTitle: string | null | undefined;

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
