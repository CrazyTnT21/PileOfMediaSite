import {applyStyleSheet, attachDelegates} from "../defaults";
import {StyleCSS} from "../style-css";
import {AttributeValue, handleFieldset, setOrRemoveBooleanAttribute} from "../inputs/common";
import html from "./app-button.html" with {type: "inline"};
import css from "./app-button.css" with {type: "inline"};
import {mapSelectors} from "../../dom";
import {disabledAttribute, typeAttribute} from "./attributes";

type AttributeKey = keyof typeof AppButton["observedAttributesMap"];

export type AppButtonElements = {
  button: HTMLButtonElement,
  slot: HTMLSlotElement
};

export class AppButton extends HTMLElement implements StyleCSS
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
    "disabled": (element: AppButton, value: AttributeValue): void => disabledAttribute(element, value, element.internals, element.hasDisabledFieldset),
    "type": typeAttribute,
  }
  static readonly observedAttributes = Object.keys(AppButton.observedAttributesMap);

  async attributeChangedCallback(name: AttributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
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
    return this.elements.button.type
  }

  set type(value: "button" | "submit" | "reset")
  {
    this.setAttribute("type", value);
  }

  connectedCallback(): void
  {
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
      disabledAttribute(this, this.getAttribute("disabled"), this.internals, this.hasDisabledFieldset)
    });
  }

  constructor()
  {
    super();
    this.internals = this.attachInternals();
    this.internals.role = "button";
    this.shadowRoot = attachDelegates(this);
    this.render();
    this.elements = mapSelectors<AppButtonElements>(this.shadowRoot, AppButton.elementSelectors);
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
    if (customElements.get("app-button"))
      return;
    customElements.define("app-button", AppButton);
  }
}

AppButton.define()
