import html from "./app-checkbox.html" with {type: "inline"};
import css from "./app-checkbox.css" with {type: "inline"};
import {ApplyStyleSheet} from "../apply-style-sheet";
import {StyleCSS} from "../style-css";
import {ValueSetEvent} from "../inputs/app-input/value-set-event";
import {AttributeValue, handleFieldset, setOrRemoveBooleanAttribute} from "../inputs/common";
import {applyStyleSheet, attach_delegates} from "../defaults";
import {dataLabelAttr, disabledAttr} from "./attributes";
import {mapSelectors} from "../../dom";

type attributeKey = keyof typeof AppCheckbox["observedAttributesMap"];
export type AppCheckboxElements = {
  input: HTMLInputElement,
  label: HTMLLabelElement
};

export class AppCheckbox extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  readonly elements: AppCheckboxElements;
  protected static readonly elementSelectors: { [key in keyof AppCheckbox["elements"]]: string } = {
    input: "input",
    label: "label",
  }
  static readonly formAssociated = true;
  errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  private readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  private interacted: boolean = false;

  private static readonly observedAttributesMap = {
    "data-label": dataLabelAttr,
    "disabled": (element: AppCheckbox, value: AttributeValue): void => disabledAttr(element, value, element.internals, element.hasDisabledFieldset),
  }
  static readonly observedAttributes = Object.keys(AppCheckbox.observedAttributesMap);

  async attributeChangedCallback(name: attributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppCheckbox.observedAttributesMap[name];
    callback(this, newValue);
  }

  get label(): string
  {
    return this.getAttribute("data-label") ?? "";
  }

  set label(value: string)
  {
    this.setAttribute("data-label", value);
  }

  get disabled(): boolean
  {
    return this.getAttribute("disabled") == "" || this.hasDisabledFieldset;
  }

  set disabled(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "disabled", value);
  }

  get checked(): boolean
  {
    return this.elements.input.checked;
  }

  set checked(value: boolean)
  {
    this.elements.input.checked = value;
    this.dispatchEvent(new ValueSetEvent({detail: value}));
  }

  private hasDisabledFieldset: boolean = false;

  async connectedCallback(): Promise<void>
  {
    this.label = this.label || "";
    this.disabled = this.getAttribute("disabled") == "";
    const {input} = this.elements;
    input.addEventListener("change", (e) => this.onCheckboxChange(e));
    handleFieldset(this, (value: boolean) =>
    {
      this.hasDisabledFieldset = value;
      disabledAttr(this, this.getAttribute("disabled"), this.internals, this.hasDisabledFieldset)
    });
  }

  async onCheckboxChange(_event: Event): Promise<void>
  {
    this.interacted = true;
  }

  constructor()
  {
    super();
    this.internals = this.setupInternals();
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
    this.elements = mapSelectors<AppCheckboxElements>(this.shadowRoot, AppCheckbox.elementSelectors);
  }

  attach = attach_delegates;
  applyStyleSheet = applyStyleSheet;

  setupInternals(): ElementInternals
  {
    const internals = this.attachInternals();
    internals.role = "checkbox";
    return internals;
  }


  render(): void
  {
    this.shadowRoot.innerHTML = html;
  }

  styleCSS(): string
  {
    return css;
  }

  static define(): void
  {
    if (customElements.get("app-checkbox"))
      return;
    customElements.define("app-checkbox", AppCheckbox);
  }
}

AppCheckbox.define();

