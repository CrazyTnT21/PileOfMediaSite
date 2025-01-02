import html from "./app-tab.html" with {type: "inline"};
import css from "./app-tab.css" with {type: "inline"};
import {ApplyStyleSheet} from "../apply-style-sheet";
import {StyleCSS} from "../style-css";
import {applyStyleSheet, attach} from "../defaults";
import {AppButton} from "../app-button/app-button";

type attributeKey = keyof typeof AppTab["observedAttributesMap"];

export class AppTab extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  private readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  private static readonly observedAttributesMap = {}
  static readonly observedAttributes = <[attributeKey]>Object.keys(AppTab.observedAttributesMap);

  async connectedCallback(): Promise<void>
  {
    const children = <HTMLElement[]><unknown>this.children;
    const headers = this.shadowRoot.querySelector("#headers")!;
    const contents = this.shadowRoot.querySelector("#contents")!;
    if (children.length == 0)
      return;
    for (const child of children)
    {
      const button = new AppButton();
      button.innerText = child.slot ?? "";
      button.dataset["name"] = child.slot ?? "";
      const slot = document.createElement("slot");
      slot.name = child.slot ?? "";
      slot.hidden = true;
      button.addEventListener("click", () =>
      {
        const previousHeader: AppButton = this.shadowRoot.querySelector("[data-selected]")!;
        const previousContent: HTMLElement = this.shadowRoot.querySelector(`slot[name="${previousHeader.dataset["name"]}"]`)!
        previousContent.hidden = true;
        delete previousHeader.dataset["selected"];
        slot.hidden = false;
        button.dataset["selected"] = "";
      });

      headers.append(button);
      contents.append(slot);
    }
    (<HTMLElement>headers.firstElementChild!).dataset["selected"] = "";
    (<HTMLElement>contents.firstElementChild).hidden = false;
  }

  constructor()
  {
    super();
    this.internals = this.setupInternals();
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
  }

  attach = attach;
  applyStyleSheet = applyStyleSheet;

  setupInternals(): ElementInternals
  {
    return this.attachInternals();
  }

  render(): void
  {
    this.shadowRoot.innerHTML = html;
  }

  styleCSS(): string
  {
    return css;
  }
}

customElements.define("app-tab", AppTab);
