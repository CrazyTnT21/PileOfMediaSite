import html from "./app-tab.html" with {type: "inline"};
import css from "./app-tab.css" with {type: "inline"};
import {applyStyleSheet, attach} from "../defaults";
import {mapSelectors} from "../../dom";
import {unsafeObjectKeys} from "../../unsafe-object-keys";

export type AppTabElements = {
  container: HTMLDivElement,
};

export class AppTab extends HTMLElement
{
  private readonly internals: ElementInternals;
  public override shadowRoot: ShadowRoot;

  private readonly elements: AppTabElements;
  protected static readonly elementSelectors: { [key in keyof AppTab["elements"]]: string } = {
    container: "#container",
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
  }

  private createChild(slotContent: Element): void
  {
    const detailsElement = document.createElement("details");
    const summary = document.createElement("summary");
    const content = document.createElement("div");
    const slot = document.createElement("slot");
    detailsElement.name = "content"

    //TODO: Display text attribute
    summary.innerText = slotContent.slot ?? "";

    slot.name = slotContent.slot ?? "";

    detailsElement.appendChild(summary);
    detailsElement.append(content);
    content.appendChild(slot);
    this.elements.container.append(detailsElement);
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
