import html from "./app-tab.html" with {type: "inline"};
import css from "./app-tab.css" with {type: "inline"};
import {applyStyleSheet, attach} from "../defaults";
import {mapSelectors} from "../../dom";
import {unsafeObjectKeys} from "../../unsafe-object-keys";
import {indexArray} from "../inputs/common";
import {logError} from "../../config";

export type AppTabElements = {
  container: HTMLDivElement,
  header: HTMLDivElement,
  content: HTMLDivElement
};

/**
 * @example
 * ```html
 * <app-tab>
 *   <span slot="slot-a-header">First tab header</span>
 *   <div slot="slot-a">
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
    //TODO: support for removal and later addition
    const childMutationObserver = new MutationObserver(x =>
    {
      for (const xy of x)
      {
        if (xy.type != "attributes")
          continue

        const matchingHeader: HTMLSlotElement | null = this.elements.header.querySelector(`slot[name="${xy.oldValue}-header"]`);
        const matchingContentHeader: HTMLSlotElement | null = this.elements.content.querySelector(`slot[name="${xy.oldValue}"]`);
        if (!matchingHeader)
        {
          logError(new Error("No matching header found when replacing slot name"));
          continue;
        }
        const slotName = (xy.target as HTMLElement).getAttribute("slot") ?? "";
        matchingContentHeader!.name = slotName
        matchingHeader.name = slotName + "-header";
        matchingHeader.innerText = slotName;
      }
    });
    for (const child of this.children)
    {
      this.createChild(child);
      childMutationObserver.observe(child, {attributes: true, attributeOldValue: true, attributeFilter: ["slot"]});
    }
    indexArray(this.elements.content.children, 0).map(x => x.setAttribute("selected", ""));
    indexArray(this.elements.header.children, 0).map(x => indexArray(x.children, 1).unwrap().setAttribute("checked", ""));
  }

  private createChild(slotContent: Element): void
  {
    if (slotContent.slot.endsWith("-header"))
      return;

    const label = document.createElement("label");
    const HeaderSlot = document.createElement("slot");
    const input = document.createElement("input");

    HeaderSlot.name = `${slotContent.slot ?? ""}-header`;

    input.type = "radio"
    input.name = "input"

    const content = document.createElement("div");
    input.addEventListener("input", () =>
    {
      this.elements.content.querySelector("[selected]")!.removeAttribute("selected")
      content.setAttribute("selected", "")
    })

    HeaderSlot.innerText = slotContent.slot;
    label.appendChild(HeaderSlot);

    const contentSlot = document.createElement("slot");
    contentSlot.name = slotContent.slot;

    content.appendChild(contentSlot);

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
