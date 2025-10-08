import {applyStyleSheet, attachDelegates} from "../../defaults";
import {StyleCSS} from "../../style-css";
import {
  handleFieldset, randomNumber, setOrDeleteState,
  setOrRemoveBooleanAttribute,
  templateString
} from "../common";
import html from "./app-textarea.html" with {type: "inline"};
import css from "./app-textarea.css" with {type: "inline"};
import {mapSelectors} from "../../../dom";
import {
  labelAttribute,
  disabledAttribute,
  maxLengthAttribute,
  minlengthAttribute,
  placeholderAttribute,
  requiredAttribute,
  rowsAttribute
} from "./attributes";
import {setMaxLength, setMinLength, setValueMissing} from "./validation";
import {Observer} from "../../../observer";
import {ValueSetEvent} from "../app-input/value-set-event";
import {mapBooleanAttribute, mapNumberAttribute, mapStringAttribute} from "../map-boolean-attribute";
import {ErrorKey, ErrorResultCallback, setValidityMap} from "../../../validation";
import {Err} from "../../../result/result";
import {unsafeObjectKeys} from "../../../unsafe-object-keys";

type AttributeKey = keyof typeof AppTextArea["observedAttributesMap"];
export type AppTextAreaElements = {
  textarea: HTMLTextAreaElement,
  label: HTMLLabelElement,
};
export const appTextAreaTexts = {
  required: "Required",
  pleaseFillOutThisInput: "Please fill out this input",
  textareaMinValidation: templateString<`${string}{min}${string}{currentLength}${string}`>
  ("Textarea requires at least {min} characters. Current length: {currentLength}"),
  textareaMaxValidation: templateString<`${string}{max}${string}{currentLength}${string}`>
  ("Textarea only allows a maximum of '{max}' characters. Current length: {currentLength}")
};

const textAreaTag = "app-textarea" as const;
export type TextAreaTag = typeof textAreaTag;

export class AppTextArea extends HTMLElement implements StyleCSS
{
  public static readonly formAssociated = true;
  protected errors: Map<number, ErrorResultCallback> = new Map();

  private readonly elements: AppTextAreaElements;
  protected static readonly elementSelectors: { [key in keyof AppTextArea["elements"]]: string } = {
    textarea: "textarea",
    label: "label"
  }
  public readonly texts = new Observer(appTextAreaTexts);
  private readonly internals: ElementInternals;
  public override readonly shadowRoot: ShadowRoot;

  protected static readonly observedAttributesMap = {
    "label": labelAttribute,
    "required": requiredAttribute,
    "disabled": disabledAttribute,
    "maxlength": maxLengthAttribute,
    "minlength": minlengthAttribute,
    "placeholder": placeholderAttribute,
    "rows": rowsAttribute
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  public static readonly observedAttributes = unsafeObjectKeys(AppTextArea.observedAttributesMap);

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

  @mapNumberAttribute("rows")
  public accessor rows: number | null | undefined;

  public get value(): any
  {
    return this.elements.textarea.value;
  }

  public set value(value: string | null | undefined)
  {
    if (value == null)
      value = "";

    this.elements.textarea.value = value;
    this.dispatchEvent(new ValueSetEvent({detail: value}));
  }

  private parentFieldSet: HTMLFieldSetElement | undefined | null

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

  public get validity(): ValidityState
  {
    return this.internals.validity;
  }

  public get validationMessage(): string
  {
    return this.internals.validationMessage;
  }

  public constructor()
  {
    super();

    this.internals = this.attachInternals();
    this.internals.role = "textarea";
    this.shadowRoot = attachDelegates(this);
    this.render();
    this.elements = mapSelectors<AppTextAreaElements>(this.shadowRoot, AppTextArea.elementSelectors);

    this.texts.addListener("required", (value) => this.elements.label.setAttribute("data-text-required", value));
    this.addEventListener(ValueSetEvent.type, (e) => this.onValueSet(e));
  }

  /**
   * Called each time the element is added to the document.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)
   */
  protected async connectedCallback(): Promise<void>
  {
    this.label = this.label || "";
    const {label} = this.elements;
    label.innerText = this.label;
    const {textarea} = this.elements;
    textarea.addEventListener("change", (e) => this.onTextAreaChange(e));
    textarea.placeholder = this.placeholder ?? "";

    handleFieldset(this, (fieldSet) => this.parentFieldSet = fieldSet, () =>
    {
      disabledAttribute(this, this.getAttribute("disabled"))
    });

    this.setupValidation();
  }

  /**
   * Called when attributes are changed, added, removed, or replaced.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  protected async attributeChangedCallback(name: AttributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppTextArea.observedAttributesMap[name];
    callback(this, newValue);
    this.updateValidity();
  }

  protected async onTextAreaChange(_event: Event): Promise<void>
  {
    this.interacted = true;
    this.internals.setFormValue(this.elements.textarea.value);
    this.updateValidity();
    this.internals.reportValidity()
  }

  protected async onValueSet(_event: Event): Promise<void>
  {
    this.updateValidity();
  }

  protected setupValidation(): void
  {
    const {textarea} = this.elements;
    this.errors = new Map();
    this.internals.setFormValue(textarea.value);
    this.addCustomError(() => setValueMissing(this, textarea));
    this.addCustomError(() => setMinLength(this, textarea));
    this.addCustomError(() => setMaxLength(this, textarea));
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

  public updateValidity(): void
  {
    const {textarea} = this.elements;
    this.internals.setValidity({});
    textarea.setCustomValidity("");

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
    setValidityMap(textarea, validityMessages);
    const validityStateFlags = Object.fromEntries([...validityMessages].map(([key, _]) => [key, true]))
    const validityMessage = [...validityMessages.values()].join("\n");
    this.internals.setValidity(validityStateFlags, validityMessage, textarea);

    if (!this.interacted)
      return;

    const invalid = validityMessages.size > 0;
    setOrDeleteState(this.internals.states, "interacted-invalid", invalid);
  }

  private interacted: boolean = false;

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
    if (customElements.get(textAreaTag))
      return;
    customElements.define(textAreaTag, AppTextArea);
  }
}

AppTextArea.define();
