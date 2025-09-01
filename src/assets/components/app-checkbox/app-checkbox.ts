import html from "./app-checkbox.html" with {type: "inline"};
import css from "./app-checkbox.css" with {type: "inline"};
import {StyleCSS} from "../style-css";
import {ValueSetEvent} from "../inputs/app-input/value-set-event";
import {handleFieldset, setOrRemoveBooleanAttribute} from "../inputs/common";
import {applyStyleSheet, attachDelegates} from "../defaults";
import {labelAttribute, disabledAttribute} from "./attributes";
import {mapSelectors} from "../../dom";

type AttributeKey = keyof typeof AppCheckbox["observedAttributesMap"];
export type AppCheckboxElements = {
  input: HTMLInputElement,
  label: HTMLLabelElement
};

export class AppCheckbox extends HTMLElement implements StyleCSS
{
  public readonly elements: AppCheckboxElements;
  protected static readonly elementSelectors: { [key in keyof AppCheckbox["elements"]]: string } = {
    input: "input",
    label: "label",
  }
  public static readonly formAssociated = true;
  protected errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  private readonly internals: ElementInternals;
  public override shadowRoot: ShadowRoot;

  private interacted: boolean = false;

  protected static readonly observedAttributesMap = {
    "label": labelAttribute,
    "disabled": disabledAttribute,
  }
  public static readonly observedAttributes = Object.keys(AppCheckbox.observedAttributesMap);

  protected async attributeChangedCallback(name: AttributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppCheckbox.observedAttributesMap[name];
    callback(this, newValue);
  }

  public get label(): string
  {
    return this.getAttribute("label") ?? "";
  }

  public set label(value: string)
  {
    this.setAttribute("label", value);
  }

  public get disabled(): boolean
  {
    return this.getAttribute("disabled") == "" || this.isDisabledByFieldSet;
  }

  public set disabled(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "disabled", value);
  }

  public get checked(): boolean
  {
    return this.elements.input.checked;
  }

  public set checked(value: boolean)
  {
    this.elements.input.checked = value;
    this.dispatchEvent(new ValueSetEvent({detail: value}));
  }

  private parentFieldSet: HTMLFieldSetElement | null | undefined;

  /**
   * If a parent fieldset is disabled, descendant form controls are also disabled.
   *
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/disabled#overview)
   */
  public get isDisabledByFieldSet(): boolean
  {
    return Boolean(this.parentFieldSet?.disabled);
  }

  protected async connectedCallback(): Promise<void>
  {
    this.label = this.label || "";
    this.disabled = this.getAttribute("disabled") == "";
    const {input} = this.elements;
    input.addEventListener("change", (e) => this.onCheckboxChange(e));

    handleFieldset(this,
        (fieldSet) => this.parentFieldSet = fieldSet,
        () => disabledAttribute(this, this.getAttribute("disabled"))
    );
  }

  protected async onCheckboxChange(_event: Event): Promise<void>
  {
    this.interacted = true;
  }

  public constructor()
  {
    super();
    this.internals = this.setupInternals();
    this.shadowRoot = attachDelegates(this);
    this.render();
    this.elements = mapSelectors<AppCheckboxElements>(this.shadowRoot, AppCheckbox.elementSelectors);
  }

  protected setupInternals(): ElementInternals
  {
    const internals = this.attachInternals();
    internals.role = "checkbox";
    return internals;
  }

  protected render(): void
  {
    this.shadowRoot.innerHTML = html;
    applyStyleSheet(this.shadowRoot, this.styleCSS());
  }

  public styleCSS(): string
  {
    return css;
  }

  public static define(): void
  {
    if (customElements.get("app-checkbox"))
      return;
    customElements.define("app-checkbox", AppCheckbox);
  }
}

AppCheckbox.define();

