import {applyStyleSheet, attach_delegates} from "../../defaults";
import {ApplyStyleSheet} from "../../apply-style-sheet";
import {StyleCSS} from "../../style-css";
import {
  AttributeValue,
  handleFieldset,
  setOrRemoveAttribute,
  setOrRemoveBooleanAttribute,
  SurroundedString,
  templateString
} from "../common";
import {ValueSetEvent} from "./value-set-event";
import html from "./app-input.html" with {type: "inline"};
import css from "./app-input.css" with {type: "inline"};
import {mapSelectors} from "../../../dom";
import {dataLabelAttr, disabledAttr, maxLengthAttr, minlengthAttr, placeholderAttr, requiredAttr} from "./attributes";
import {setMaxLength, setMinLength, setValueMissing} from "./validation";
import {Observer} from "../../../observer";

type attributeKey = keyof typeof AppInput["observedAttributesMap"];

export type AppInputElements = {
  input: HTMLInputElement,
  label: HTMLLabelElement,
};
export const appInputTexts = {
  required: "Required",
  inputMinValidation: templateString<`${SurroundedString<"{min}">}{currentLength}${string}`>("Input only allows a maximum of {min} characters. Current length: {currentLength}"),
  inputMaxValidation: templateString<`${SurroundedString<"{max}">}{currentLength}${string}`>("Input requires at least {min} characters. Current length: {currentLength}")
};

export class AppInput extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  readonly elements: AppInputElements;
  protected static readonly elementSelectors: { [key in keyof AppInput["elements"]]: string } = {
    input: "input",
    label: "label",
  }
  readonly texts = new Observer(appInputTexts);

  static readonly formAssociated = true;
  errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  private readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  protected static readonly observedAttributesMap = {
    "data-label": dataLabelAttr,
    "required": requiredAttr,
    "disabled": (element: AppInput, value: AttributeValue): void => disabledAttr(element, value, element.internals, element.hasDisabledFieldset),
    "maxlength": maxLengthAttr,
    "minlength": minlengthAttr,
    "placeholder": placeholderAttr,
  }
  static readonly observedAttributes = <[attributeKey]>Object.keys(AppInput.observedAttributesMap);

  async attributeChangedCallback(name: string, _oldValue: AttributeValue, newValue: AttributeValue): Promise<void>
  {
    const callback = AppInput.observedAttributesMap[name as attributeKey]!;
    callback(this, newValue);
    await this.validate();
    this.texts.get("required")
  }

  get label(): string
  {
    return this.getAttribute("data-label") ?? "";
  }

  set label(value: string)
  {
    this.setAttribute("data-label", value)
  }

  get required(): boolean
  {
    const attribute = this.getAttribute("required");
    return attribute ? attribute == "" : false;
  }

  set required(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "required", value);
  }

  get disabled(): boolean
  {
    return this.getAttribute("disabled") == "" || this.hasDisabledFieldset;
  }

  set disabled(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "disabled", value);
  }

  get minLength(): number | null
  {
    const attribute = this.getAttribute("minlength");
    return attribute ? Number(attribute) : null;
  }

  set minLength(value: number | null)
  {
    setOrRemoveAttribute(this, "minlength", value?.toString());
  }

  get maxLength(): number | null
  {
    const attribute = this.getAttribute("maxlength");
    return attribute ? Number(attribute) : null;
  }

  set maxLength(value: number | null)
  {
    setOrRemoveAttribute(this, "maxlength", value?.toString());
  }

  get value(): any
  {
    return this.elements.input.value;
  }

  set value(value: string | null | undefined)
  {
    if (value == null)
      value = "";

    const {input} = this.elements;
    input.value = value;
    this.dispatchEvent(new ValueSetEvent({detail: value}));
  }

  private hasDisabledFieldset: boolean = false;

  get placeholder(): string | null
  {
    return this.getAttribute("placeholder")
  }

  set placeholder(value: string | null)
  {
    setOrRemoveAttribute(this, "placeholder", value);
  }

  async connectedCallback(): Promise<void>
  {
    this.label = this.label || "";
    this.disabled = this.getAttribute("disabled") == "";
    const {input} = this.elements;
    input.addEventListener("change", (e) => this.onInputChange(e));
    input.placeholder = this.placeholder ?? "";
    this.handleInitialValueAttribute();

    handleFieldset(this, (value: boolean) =>
    {
      this.hasDisabledFieldset = value;
      disabledAttr(this, this.getAttribute("disabled"), this.internals, this.hasDisabledFieldset)
    });

    await this.setupValidation();
  }

  private handleInitialValueAttribute(): void
  {
    let valueAttribute = this.getAttribute("value");
    if (valueAttribute == null)
      valueAttribute = "";
    const {input} = this.elements;
    input.value = valueAttribute;
  }

  protected async onValueSet(_event: Event): Promise<void>
  {
    await this.validate();
  }

  protected async onInputChange(_event: Event): Promise<void>
  {
    this.interacted = true;
    await this.validateAndReport();
  }

  constructor()
  {
    super();
    this.internals = this.setupInternals();
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
    this.addEventListener(ValueSetEvent.type, (e) => this.onValueSet(e));
    this.elements = mapSelectors<AppInputElements>(this.shadowRoot, AppInput.elementSelectors);

    this.texts.addListener("required", (value) =>
    {
      this.elements.label.setAttribute("data-text-required", value);
    });
  }

  attach = attach_delegates;
  applyStyleSheet = applyStyleSheet;

  setupInternals(): ElementInternals
  {
    const internals = this.attachInternals();
    internals.role = "textbox";
    return internals;
  }

  async setupValidation(): Promise<void>
  {
    const {input} = this.elements;
    input.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  async validate(): Promise<void>
  {
    const {input} = this.elements;
    await this.setValidity(input);
    this.internals.setValidity({});
    input.setCustomValidity("");
    const error = this.errors.entries().next().value;
    if (error)
    {
      this.internals.setValidity({[error[0]]: true}, error[1](), input);
      input.setCustomValidity(error[1]());
    }
    this.setCustomError = (): void =>
    {
    };
    if (!this.interacted)
      return;

    const invalid = !input.checkValidity();
    setOrRemoveBooleanAttribute(this, "data-invalid", invalid);
    setOrRemoveBooleanAttribute(input, "data-invalid", invalid);
  }

  private interacted: boolean = false;

  async validateAndReport(): Promise<void>
  {
    await this.validate();
    const {input} = this.elements;
    const error = this.errors.entries().next().value;
    if (error)
      input.setCustomValidity(error[1]());
    this.internals.reportValidity();
  }

  async setValidity(input: HTMLInputElement): Promise<void>
  {
    this.internals.setFormValue(input.value);
    this.errors = new Map();
    setValueMissing(this, input);
    setMinLength(this, input);
    setMaxLength(this, input);
    this.setCustomError(input);
  }

  async valid(): Promise<boolean>
  {
    const {input} = this.elements;
    await this.setValidity(input);
    return this.errors.size == 0;
  }

  setCustomError(_input: HTMLInputElement): void
  {
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
    if (customElements.get("app-input"))
      return;
    customElements.define("app-input", AppInput);
  }
}

AppInput.define();
