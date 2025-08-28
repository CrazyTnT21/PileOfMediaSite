import {applyStyleSheet, attachDelegates} from "../../defaults";
import {StyleCSS} from "../../style-css";
import {
  AttributeValue,
  handleFieldset,
  setOrRemoveBooleanAttribute,
  IncludesString,
  templateString
} from "../common";
import {ValueSetEvent} from "./value-set-event";
import html from "./app-input.html" with {type: "inline"};
import css from "./app-input.css" with {type: "inline"};
import {mapSelectors} from "../../../dom";
import {
  labelAttribute,
  disabledAttribute,
  maxLengthAttribute,
  minlengthAttribute,
  placeholderAttribute,
  requiredAttribute
} from "./attributes";
import {setMaxLength, setMinLength, setValueMissing} from "./validation";
import {Observer} from "../../../observer";
import {mapBooleanAttribute, mapNumberAttribute, mapStringAttribute} from "../map-boolean-attribute";

type AttributeKey = keyof typeof AppInput["observedAttributesMap"];

export type AppInputElements = {
  input: HTMLInputElement,
  label: HTMLLabelElement,
};
export const appInputTexts = {
  required: "Required",
  valueMissing: "No value given",
  inputMinValidation: templateString<IncludesString<["{min}", "{currentLength}"]>>
  ("Input requires at least '{min}' characters. Current length: {currentLength}"),
  inputMaxValidation: templateString<IncludesString<["{max}", "{currentLength}"]>>
  ("Input only allows a maximum of '{max}' characters. Current length: {currentLength}"),
};

export class AppInput extends HTMLElement implements StyleCSS
{
  readonly elements: AppInputElements;
  protected static readonly elementSelectors: { [key in keyof AppInput["elements"]]: string } = {
    input: "input",
    label: "label",
  }
  readonly texts = new Observer(appInputTexts);

  static readonly formAssociated = true;
  errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  protected readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  protected static readonly observedAttributesMap = {
    "label": labelAttribute,
    "required": requiredAttribute,
    "disabled": (element: AppInput, value: AttributeValue): void => disabledAttribute(element, value, element.internals, element.hasDisabledFieldset),
    "maxlength": maxLengthAttribute,
    "minlength": minlengthAttribute,
    "placeholder": placeholderAttribute,
  }
  static readonly observedAttributes = Object.keys(AppInput.observedAttributesMap);

  async attributeChangedCallback(name: AttributeKey, _oldValue: AttributeValue, newValue: AttributeValue): Promise<void>
  {
    if (!("observedAttributesMap" in this.constructor))
      return;

    const callback = (<typeof AppInput.observedAttributesMap>this.constructor["observedAttributesMap"])[name];
    callback(this, newValue);
    await this.validate();
  }

  get label(): string
  {
    return this.getAttribute("label") ?? "";
  }

  set label(value: string)
  {
    this.setAttribute("label", value)
  }

  @mapBooleanAttribute("required")
  accessor required: boolean = null!;

  get disabled(): boolean
  {
    return this.getAttribute("disabled") == "" || this.hasDisabledFieldset;
  }

  set disabled(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "disabled", value);
  }

  @mapNumberAttribute("minlength")
  accessor minLength: number | null | undefined;

  @mapNumberAttribute("maxlength")
  accessor maxLength: number | null | undefined;

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

  protected hasDisabledFieldset: boolean = false;

  @mapStringAttribute("placeholder")
  accessor placeholder: string | null | undefined;

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
      //TODO: as conversion
      (this.constructor as typeof AppInput)["observedAttributesMap"]["disabled"](this, this.getAttribute("disabled"))
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
    this.shadowRoot = attachDelegates(this);
    this.render();
    this.addEventListener(ValueSetEvent.type, (e) => this.onValueSet(e));
    this.elements = mapSelectors<AppInputElements>(this.shadowRoot, AppInput.elementSelectors);

    this.texts.addListener("required", (value) =>
    {
      this.elements.label.setAttribute("data-text-required", value);
    });
  }

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
    applyStyleSheet(this.shadowRoot, this.styleCSS());
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
