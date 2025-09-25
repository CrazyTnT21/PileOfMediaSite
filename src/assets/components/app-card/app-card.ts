import {applyStyleSheet, attach} from "../defaults";
import {StyleCSS} from "../style-css";
import html from "./app-card.html" with {type: "inline"}
import css from "./app-card.css" with {type: "inline"}
import {mapSelectors} from "../../dom";
import {coverAltAttribute, hrefAttribute, srcsetAttribute, itemTitleAttribute} from "./attributes";
import {mapStringAttribute} from "../inputs/map-boolean-attribute";
import {unsafeObjectKeys} from "../../unsafe-object-keys";

type AttributeKey = keyof typeof AppCard["observedAttributesMap"];

export type AppCardElements = {
  image: HTMLImageElement,
  anchor: HTMLAnchorElement,
  titleSlot: HTMLSlotElement
};

export class AppCard extends HTMLElement implements StyleCSS
{
  public override shadowRoot: ShadowRoot;
  private readonly elements: AppCardElements;
  protected static readonly elementSelectors: { [key in keyof AppCard["elements"]]: string } = {
    image: "img",
    anchor: "a",
    titleSlot: "[name='title']"
  }

  protected static readonly observedAttributesMap = {
    "srcset": srcsetAttribute,
    "cover-alt": coverAltAttribute,
    "item-title": itemTitleAttribute,
    "href": hrefAttribute
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  public static readonly observedAttributes = unsafeObjectKeys(AppCard.observedAttributesMap);

  @mapStringAttribute("srcset")
  public accessor srcset: string | null | undefined;

  @mapStringAttribute("cover-alt")
  public accessor coverAlt: string | null | undefined;

  @mapStringAttribute("href")
  public accessor href: string | null | undefined;

  @mapStringAttribute("item-title")
  public accessor itemTitle: string | null | undefined;

  public constructor()
  {
    super();
    this.shadowRoot = attach(this);
    this.render();
    this.elements = mapSelectors<AppCardElements>(this.shadowRoot, AppCard.elementSelectors);
  }

  /**
   * Called when attributes are changed, added, removed, or replaced.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  protected async attributeChangedCallback(name: AttributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppCard.observedAttributesMap[name];
    callback(this, newValue);
  }

  protected render(): void
  {
    this.shadowRoot.innerHTML = html;
    applyStyleSheet(this.shadowRoot, this.styleCSS());
  }

  public styleCSS(): string
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
