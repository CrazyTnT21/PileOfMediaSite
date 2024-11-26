import {applyStyleSheet, attach_delegates} from "../defaults";
import {StyleCSS} from "../style-css";
import {ApplyStyleSheet} from "../apply-style-sheet";
import {handleFieldset} from "../inputs/common";
import html from "./app-button.html" with {type: "inline"};
import css from "./app-button.css" with {type: "inline"};

type attributeKey = keyof typeof AppButton["observedAttributesMap"];

export class AppButton extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  static readonly formAssociated = true;
  private readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  private static readonly observedAttributesMap = {
    "disabled": AppButton.disabledAttr,
    "type": AppButton.typeAttr,
  }
  static readonly observedAttributes = <[attributeKey]>Object.keys(AppButton.observedAttributesMap);

  async attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppButton.observedAttributesMap[name as attributeKey]!;
    callback(this, newValue);
  }

  //Attributes

  private static disabledAttr(element: AppButton, value: string | null | undefined): void
  {
    const disabled = element.hasDisabledFieldset || value == "";
    const button = element.shadowRoot.querySelector("button")!;
    button.disabled = disabled;
    element.internals.ariaDisabled = disabled ? "" : null;
  }

  private static typeAttr(element: AppButton, value: string | null | undefined): void
  {
    const button = element.shadowRoot.querySelector("button")!;
    button.type = value as "button" | "reset" | "submit";
  }

  get disabled(): boolean
  {
    return this.getAttribute("disabled") == "" || this.hasDisabledFieldset;
  }

  set disabled(value: boolean)
  {
    if (value)
      this.setAttribute("disabled", "")
    else
      this.removeAttribute("disabled");
  }

  private internalHasDisabledFieldset: boolean = false;

  get hasDisabledFieldset(): boolean
  {
    return this.internalHasDisabledFieldset;
  }

  set hasDisabledFieldset(value: boolean)
  {
    this.internalHasDisabledFieldset = value;
    AppButton.disabledAttr(this, this.getAttribute("disabled"))
  }

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
    const button = this.shadowRoot.querySelector("button")!;
    const type = this.getAttribute("type");
    if (type && ["submit", "button", "reset"].includes(type))
      this.type = type as "submit" | "button" | "reset";
    else
      this.type = "submit";
    button.type = this.type;

    button.addEventListener("click", e =>
    {
      const button = <HTMLButtonElement>e.target;
      if (button.type == "submit" && this.internals.form)
      {
        if (this.internals.form.reportValidity())
          this.internals.form.requestSubmit();
      }
    });
    handleFieldset(this);
  }

  constructor()
  {
    super();
    this.internals = this.attachInternals();
    this.internals.role = "button";
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
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
