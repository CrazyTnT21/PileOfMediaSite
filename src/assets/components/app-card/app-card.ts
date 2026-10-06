import {applyStyleSheet, attach} from "../defaults";
import html from "./app-card.html" with {type: "inline"}
import css from "./app-card.css" with {type: "inline"}
import {mapSelectors} from "../../dom";
import {coverAltAttribute, hrefAttribute, srcsetAttribute, itemTitleAttribute, sizesAttribute} from "./attributes";
import {mapStringAttribute} from "../inputs/map-boolean-attribute";
import {unsafeObjectKeys} from "../../unsafe-object-keys";
import {last, parseImageElementSizes} from "../inputs/common";

type AttributeKey = keyof typeof AppCard["observedAttributesMap"];

export type AppCardElements = {
  image: HTMLImageElement,
  anchor: HTMLAnchorElement,
  titleSlot: HTMLSlotElement
};

export class AppCard extends HTMLElement
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
    "sizes": sizesAttribute,
    "cover-alt": coverAltAttribute,
    "item-title": itemTitleAttribute,
    "href": hrefAttribute
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  public static readonly observedAttributes = unsafeObjectKeys(AppCard.observedAttributesMap);

  @mapStringAttribute("srcset")
  private accessor srcsetAttribute: string | null | undefined;

  public set srcset(value: { imageUri: string, descriptor: { width: number } | { pixelDensity: number } }[])
  {
    if (value.length == 0)
    {
      this.sizesAttribute = null;
      return;
    }
    this.srcsetAttribute = value.map(x =>
    {
      let descriptor;
      if ("width" in x.descriptor)
        descriptor = x.descriptor.width.toFixed(0) + "w";
      else
        descriptor = x.descriptor.pixelDensity.toPrecision(2) + "x"

      return `${x.imageUri} ${descriptor}`
    }).join(",");
  }

  @mapStringAttribute("sizes")
  private accessor sizesAttribute: string | null | undefined;

  public set sizes(sizes: [...({ mediaCondition: string, sourceSizeValue: string } | "auto")[], ({
    sourceSizeValue: string
  } | "auto")] | [])
  {
    if (sizes.length == 0)
    {
      this.sizesAttribute = null;
      return;
    }

    this.sizesAttribute = [
      ...sizes.slice(0, -1).map(parseImageElementSizes),
      last(sizes).map(parseImageElementSizes).unwrap()
    ].join(",")
  }

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

  private styleCSS(): string
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
