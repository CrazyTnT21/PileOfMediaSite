import html from "./app-tab.html" with {type: "inline"};
import css from "./app-tab.css" with {type: "inline"};
import {applyStyleSheet, attach} from "../defaults";
import {mapSelectors} from "../../dom";
import {unsafeObjectKeys} from "../../unsafe-object-keys";
import {indexArray} from "../inputs/common";

export type AppTabElements = {
  container: HTMLDivElement,
  header: HTMLDivElement,
  content: HTMLDivElement
};

/**
 * @example
 * ```html
 * <app-tab>
 *   <div slot="Slotname A">
 *     First tab
 *   </div>
 *   <div slot="Slotname B">
 *     Second tab
 *   </div>
 * </app-tab>
 * ```
 */
export class AppTab extends HTMLElement
{
  private readonly internals: ElementInternals;
  public override shadowRoot: ShadowRoot;

  private readonly elements: AppTabElements;
  protected static readonly elementSelectors: { [key in keyof AppTab["elements"]]: string } = {
    container: "#container",
    header: "#header",
    content: "#content"
  }
  protected static readonly observedAttributesMap = {}

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  public static readonly observedAttributes = unsafeObjectKeys(AppTab.observedAttributesMap);

  public constructor()
  {
    super();
    this.internals = this.setupInternals();
    this.shadowRoot = attach(this);
    this.render();
    this.elements = mapSelectors<AppTabElements>(this.shadowRoot, AppTab.elementSelectors);
  }

  /**
   * Called each time the element is added to the document.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)
   */
  protected async connectedCallback(): Promise<void>
  {
    for (const child of this.children)
    {
      this.createChild(child);
    }
    indexArray(this.elements.content.children, 0).map(x => x.setAttribute("selected", ""));
    indexArray(this.elements.header.children, 0).map(x => indexArray(x.children,0).unwrap().setAttribute("checked", ""));
  }

  private createChild(slotContent: Element): void
  {
    const label = document.createElement("label");
    const input = document.createElement("input");

    input.type = "radio"
    input.name = "input"

    const content = document.createElement("div");
    input.addEventListener("input", () =>
    {
      this.elements.content.querySelector("[selected]")!.removeAttribute("selected")
      content.setAttribute("selected", "")
    })

    //TODO: Display text attribute
    label.innerText = slotContent.slot ?? "";

    const slot = document.createElement("slot");
    slot.name = slotContent.slot ?? "";

    content.appendChild(slot);
    this.elements.content.appendChild(content);

    label.appendChild(input);
    this.elements.header.appendChild(label);
  }

  protected setupInternals(): ElementInternals
  {
    return this.attachInternals();
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
    if (customElements.get("app-tab"))
      return;
    customElements.define("app-tab", AppTab);
  }
}

AppTab.define();
