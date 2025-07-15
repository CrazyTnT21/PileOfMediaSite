import {applyStyleSheet, attach_delegates} from "../defaults";
import {StyleCSS} from "../style-css";
import {ApplyStyleSheet} from "../apply-style-sheet";
import {AttributeValue, handleFieldset, setOrRemoveBooleanAttribute} from "../inputs/common";
import html from "./app-button.html" with {type: "inline"};
import css from "./app-button.css" with {type: "inline"};
import {mapSelectors} from "../../dom";
import {disabledAttr, typeAttr} from "./attributes";

type attributeKey = keyof typeof AppButton["observedAttributesMap"];

export type AppButtonElements = {
  button: HTMLButtonElement,
  slot: HTMLSlotElement
};

export class AppButton extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  readonly elements: AppButtonElements;
  protected static readonly elementSelectors: { [key in keyof AppButton["elements"]]: string } = {
    button: "button",
    slot: "slot"
  }
  static readonly formAssociated = true;
  private readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  private static readonly observedAttributesMap = {
    "disabled": (element: AppButton, value: AttributeValue): void => disabledAttr(element, value, element.internals, element.hasDisabledFieldset),
    "type": typeAttr,
  }
  static readonly observedAttributes = Object.keys(AppButton.observedAttributesMap);

  async attributeChangedCallback(name: attributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppButton.observedAttributesMap[name];
    callback(this, newValue);
  }

  get disabled(): boolean
  {
    return this.getAttribute("disabled") == "" || this.hasDisabledFieldset;
  }

  set disabled(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "disabled", value);
  }

  private hasDisabledFieldset: boolean = false;

  get type(): "button" | "submit" | "reset"
  {
    const attribute = this.getAttribute("type");
    if (attribute && ["button", "submit", "reset"].includes(attribute))
      return attribute as "button" | "reset" | "submit";
    return "submit";
  }

  set type(value: "button" | "submit" | "reset")
  {
    this.setAttribute("type", value);
  }

  connectedCallback(): void
  {
    const {button} = this.elements;
    const type = this.getAttribute("type");
    if (type && ["submit", "button", "reset"].includes(type))
      this.type = type as "submit" | "button" | "reset";
    else
      this.type = "submit";
    button.type = this.type;

    this.addEventListener("click", e =>
    {
      const button = <HTMLButtonElement>e.target;
      if (button.type == "submit" && this.internals.form)
      {
        if (this.internals.form.reportValidity())
          this.internals.form.requestSubmit();
      }
    });
    handleFieldset(this, (value: boolean) =>
    {
      this.hasDisabledFieldset = value;
      disabledAttr(this, this.getAttribute("disabled"), this.internals, this.hasDisabledFieldset)
    });
  }

  constructor()
  {
    super();
    this.internals = this.attachInternals();
    this.internals.role = "button";
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
    this.elements = mapSelectors<AppButtonElements>(this.shadowRoot, AppButton.elementSelectors);
  }

  attach = attach_delegates;
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
    if (customElements.get("app-button"))
      return;
    customElements.define("app-button", AppButton);
  }
}

AppButton.define()
