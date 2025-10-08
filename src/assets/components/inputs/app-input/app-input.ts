import {applyStyleSheet, attachDelegates} from "../../defaults";
import {StyleCSS} from "../../style-css";
import {
  AttributeValue,
  handleFieldset,
  setOrRemoveBooleanAttribute,
  IncludesString,
  templateString,
  randomNumber,
  setOrDeleteState
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
import {Err} from "../../../result/result";
import {ErrorResultCallback, ErrorKey, setValidityMap} from "../../../validation";

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

const inputTag = "app-input" as const;
export type InputTag = typeof inputTag;

export class AppInput extends HTMLElement implements StyleCSS
{
  protected readonly elements: AppInputElements;
  protected static readonly elementSelectors: { [key in keyof AppInput["elements"]]: string } = {
    input: "input",
    label: "label",
  }
  public readonly texts = new Observer(appInputTexts);

  public static readonly formAssociated = true;
  protected errors: Map<number, ErrorResultCallback> = new Map();

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

  private interacted: boolean = false;

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  public static readonly observedAttributes = Object.keys(AppInput.observedAttributesMap); //TODO: unsafeObjectKeys: inherited class incorrectly extends base class

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

  public get validity(): ValidityState
  {
    return this.internals.validity;
  }

  public get validationMessage(): string
  {
    return this.internals.validationMessage;
  }

  @mapStringAttribute("placeholder")
  public accessor placeholder: string | null | undefined;

  public constructor()
  {
    super();
    this.internals = this.setupInternals();
    this.shadowRoot = attachDelegates(this);
    this.render();
    this.addEventListener(ValueSetEvent.type, (e) => this.onValueSet(e));
    this.elements = mapSelectors<AppInputElements>(this.shadowRoot, AppInput.elementSelectors);
  }

  /**
   * Called each time the element is added to the document.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)
   */
  protected async connectedCallback(): Promise<void>
  {
    //TODO: (Should be in constructor) When in constructor: inherited class doesn't update text on change
    this.texts.addListener("required", (value) => this.elements.label.setAttribute("data-text-required", value));

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

  /**
   * Called when attributes are changed, added, removed, or replaced.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  protected async attributeChangedCallback(name: AttributeKey, _oldValue: AttributeValue, newValue: AttributeValue): Promise<void>
  {
    if (!("observedAttributesMap" in this.constructor))
      return;

    const callback = (<typeof AppInput.observedAttributesMap>this.constructor["observedAttributesMap"])[name];
    callback(this, newValue);
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
      this.internals.states.delete("interacted-invalid")
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
    setValidityMap(input, validityMessages);
    const validityStateFlags = Object.fromEntries([...validityMessages].map(([key, _]) => [key, true]))
    const validityMessage = [...validityMessages.values()].join("\n");
    this.internals.setValidity(validityStateFlags, validityMessage, input);

    if (!this.interacted)
      return;

    const invalid = validityMessages.size > 0;
    setOrDeleteState(this.internals.states, "interacted-invalid", invalid);
  }

  public addCustomError(callback: ErrorResultCallback): ErrorKey
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
    if (customElements.get(inputTag))
      return;
    customElements.define(inputTag, AppInput);
  }
}

AppInput.define();
