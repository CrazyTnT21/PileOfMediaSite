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
  public readonly elements: AppInputElements;
  protected static readonly elementSelectors: { [key in keyof AppInput["elements"]]: string } = {
    input: "input",
    label: "label",
  }
  public readonly texts = new Observer(appInputTexts);

  public static readonly formAssociated = true;
  protected errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  protected readonly internals: ElementInternals;
  public override shadowRoot: ShadowRoot;

  protected static readonly observedAttributesMap = {
    "label": labelAttribute,
    "required": requiredAttribute,
    "disabled": (element: AppInput, value: AttributeValue): void => disabledAttribute(element, value, element.internals, element.hasDisabledFieldset),
    "maxlength": maxLengthAttribute,
    "minlength": minlengthAttribute,
    "placeholder": placeholderAttribute,
  }
  public static readonly observedAttributes = Object.keys(AppInput.observedAttributesMap);

  protected async attributeChangedCallback(name: AttributeKey, _oldValue: AttributeValue, newValue: AttributeValue): Promise<void>
  {
    if (!("observedAttributesMap" in this.constructor))
      return;

    const callback = (<typeof AppInput.observedAttributesMap>this.constructor["observedAttributesMap"])[name];
    callback(this, newValue);
    await this.validate();
  }

  public get label(): string
  {
    return this.getAttribute("label") ?? "";
  }

  public set label(value: string)
  {
    this.setAttribute("label", value)
  }

  @mapBooleanAttribute("required")
  public accessor required: boolean = null!;

  public get disabled(): boolean
  {
    return this.getAttribute("disabled") == "" || this.hasDisabledFieldset;
  }

  public set disabled(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "disabled", value);
  }

  @mapNumberAttribute("minlength")
  public accessor minLength: number | null | undefined;

  @mapNumberAttribute("maxlength")
  public accessor maxLength: number | null | undefined;

  public get value(): any
  {
    return this.elements.input.value;
  }

  public set value(value: string | null | undefined)
  {
    if (value == null)
      value = "";

    const {input} = this.elements;
    input.value = value;
    this.dispatchEvent(new ValueSetEvent({detail: value}));
  }

  protected hasDisabledFieldset: boolean = false;

  @mapStringAttribute("placeholder")
  public accessor placeholder: string | null | undefined;

  protected async connectedCallback(): Promise<void>
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

  public constructor()
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

  protected setupInternals(): ElementInternals
  {
    const internals = this.attachInternals();
    internals.role = "textbox";
    return internals;
  }

  protected async setupValidation(): Promise<void>
  {
    const {input} = this.elements;
    input.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  public async validate(): Promise<void>
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

  public async validateAndReport(): Promise<void>
  {
    await this.validate();
    const {input} = this.elements;
    const error = this.errors.entries().next().value;
    if (error)
      input.setCustomValidity(error[1]());
    this.internals.reportValidity();
  }

  protected async setValidity(input: HTMLInputElement): Promise<void>
  {
    this.internals.setFormValue(input.value);
    this.errors = new Map();
    setValueMissing(this, input);
    setMinLength(this, input);
    setMaxLength(this, input);
    this.setCustomError(input);
  }

  public async valid(): Promise<boolean>
  {
    const {input} = this.elements;
    await this.setValidity(input);
    return this.errors.size == 0;
  }

  public setCustomError(_input: HTMLInputElement): void
  {
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
    if (customElements.get("app-input"))
      return;
    customElements.define("app-input", AppInput);
  }
}

AppInput.define();
