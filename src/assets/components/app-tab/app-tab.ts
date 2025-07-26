import html from "./app-tab.html" with {type: "inline"};
import css from "./app-tab.css" with {type: "inline"};
import {ApplyStyleSheet} from "../apply-style-sheet";
import {StyleCSS} from "../style-css";
import {applyStyleSheet, attach} from "../defaults";
import {AppButton} from "../app-button/app-button";
import {mapSelectors} from "../../dom";
import {unsafeObjectKeys} from "../../unsafe-object-keys";

export type AppTabElements = {
  headers: HTMLDivElement,
  contents: HTMLDivElement,
};

export class AppTab extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  private readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  readonly elements: AppTabElements;
  protected static readonly elementSelectors: { [key in keyof AppTab["elements"]]: string } = {
    headers: "#headers",
    contents: "#contents"
  }
  private static readonly observedAttributesMap = {}
  static readonly observedAttributes = unsafeObjectKeys(AppTab.observedAttributesMap);

  async connectedCallback(): Promise<void>
  {
    const children = <HTMLElement[]><unknown>this.children;
    const {headers, contents} = this.elements;
    if (children.length == 0)
      return;
    for (const child of children)
    {
      const button = new AppButton();
      button.innerText = child.slot ?? "";
      button.setAttribute("data-name", child.slot ?? "")
      const slot = document.createElement("slot");
      slot.name = child.slot ?? "";
      slot.hidden = true;
      button.addEventListener("click", () =>
      {
        const previousHeader: AppButton = this.shadowRoot.querySelector("[data-selected]")!;
        const previousContent: HTMLElement = this.shadowRoot.querySelector(`slot[name="${previousHeader.getAttribute("data-name")}"]`)!
        previousContent.hidden = true;
        previousHeader.removeAttribute("data-selected");
        slot.hidden = false;
        button.setAttribute("data-selected", "")
      });

      headers.append(button);
      contents.append(slot);
    }
    (<HTMLElement>headers.firstElementChild!).setAttribute("data-selected", "");
    (<HTMLElement>contents.firstElementChild).hidden = false;
  }

  constructor()
  {
    super();
    this.internals = this.setupInternals();
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
    this.elements = mapSelectors<AppTabElements>(this.shadowRoot, AppTab.elementSelectors);
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

  public static define(): void
  {
    if (customElements.get("app-tab"))
      return;
    customElements.define("app-tab", AppTab);
  }
}

AppTab.define();
