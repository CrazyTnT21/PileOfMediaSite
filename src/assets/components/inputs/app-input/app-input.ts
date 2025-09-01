import {applyStyleSheet, attachDelegates} from "../../defaults";
import {StyleCSS} from "../../style-css";
import {
  AttributeValue,
  handleFieldset,
  setOrRemoveBooleanAttribute,
  IncludesString,
  templateString, randomNumber, NonEmptyString
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
import {Err, Result} from "../../../result/result";

type AttributeKey = keyof typeof AppInput["observedAttributesMap"];

export type AppInputElements = {
  input: HTMLInputElement,
  label: HTMLLabelElement,
};
export const appInputTexts = {
  required: "Required",
  pleaseFillOutThisInput: "Please fill out this input",
  inputMinValidation: templateString<IncludesString<["{min}", "{currentLength}"]>>
  ("Input requires at least '{min}' characters. Current length: {currentLength}"),
  inputMaxValidation: templateString<IncludesString<["{max}", "{currentLength}"]>>
  ("Input only allows a maximum of '{max}' characters. Current length: {currentLength}"),
};
export type ErrorObject = { state: keyof ValidityStateFlags, userMessage: NonEmptyString };
export type ErrorResult = Result<void, ErrorObject>;
type ErrorCallback = () => ErrorResult;
type ErrorKey = number;

export class AppInput extends HTMLElement implements StyleCSS
{
  public readonly elements: AppInputElements;
  protected static readonly elementSelectors: { [key in keyof AppInput["elements"]]: string } = {
    input: "input",
    label: "label",
  }
  public readonly texts = new Observer(appInputTexts);

  public static readonly formAssociated = true;
  protected errors: Map<number, ErrorCallback> = new Map();

  protected readonly internals: ElementInternals;
  public override shadowRoot: ShadowRoot;

  protected static readonly observedAttributesMap = {
    "label": labelAttribute,
    "required": requiredAttribute,
    "disabled": disabledAttribute,
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
    this.updateValidity();
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
    return this.getAttribute("disabled") == "" || this.isDisabledByFieldSet;
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

    handleFieldset(this,
        (fieldSet) => this.parentFieldSet = fieldSet,
        () =>
        {
          //TODO: as conversion
          (this.constructor as typeof AppInput)["observedAttributesMap"]["disabled"](this, this.getAttribute("disabled"))
        });

    this.setupValidation();
    this.updateValidity();
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
    this.updateValidity();
  }

  protected async onInputChange(_event: Event): Promise<void>
  {
    this.interacted = true;
    this.internals.setFormValue(this.elements.input.value);
    this.updateValidity();
    this.internals.reportValidity()
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

  protected setupValidation(): void
  {
    const {input} = this.elements;
    this.errors = new Map();
    this.internals.setFormValue(input.value);
    this.addCustomError(() => setValueMissing(this, input));
    this.addCustomError(() => setMinLength(this, input));
    this.addCustomError(() => setMaxLength(this, input));
  }

  public updateValidity(): void
  {
    const {input} = this.elements;
    this.internals.setValidity({});
    input.setCustomValidity("");

    if (!this.internals.willValidate)
    {
      setOrRemoveBooleanAttribute(this, "data-invalid", false);
      setOrRemoveBooleanAttribute(input, "data-invalid", false);
      return;
    }

    const validityMessages: Map<keyof ValidityStateFlags, string> = new Map();
    for (const [_, errorEntry] of this.errors)
    {
      const {error} = errorEntry();
      if (error)
      {
        validityMessages.set(error.state, error.userMessage);
      }
    }
    this.validateInternalInput(validityMessages);

    const validityStateFlags = Object.fromEntries([...validityMessages].map(([key, _]) => [key, true]))
    const validityMessage = [...validityMessages.values()].join("\n");
    this.internals.setValidity(validityStateFlags, validityMessage, input);

    if (!this.interacted)
      return;

    const invalid = validityMessages.size > 0;
    setOrRemoveBooleanAttribute(this, "data-invalid", invalid);
    setOrRemoveBooleanAttribute(input, "data-invalid", invalid);
  }

  private validateInternalInput(validityMessages: Map<keyof ValidityStateFlags, string>): void
  {
    const {input} = this.elements;
    for (const x in input.validity)
    {
      if (x == "valid")
        return;

      if (input.validity[x as keyof ValidityState])
      {
        validityMessages.set(x as keyof ValidityStateFlags, input.validationMessage);
      }
    }
  }

  private interacted: boolean = false;

  public addCustomError(callback: ErrorCallback): ErrorKey
  {
    const errorKey = randomNumber();
    this.errors.set(errorKey, callback);
    return errorKey
  }

  public removeCustomError(key: ErrorKey): void
  {
    this.errors.delete(key);
  }

  public setCustomValidity(validity: keyof ValidityStateFlags, message: string): void
  {
    const errorKey = this.addCustomError(() => new Err({state: validity, userMessage: message}));
    this.updateValidity();
    this.removeCustomError(errorKey);
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

  //TODO components not defined when loading async module scripts
  public static define(): void
  {
    if (customElements.get("app-input"))
      return;
    customElements.define("app-input", AppInput);
  }
}

AppInput.define();
