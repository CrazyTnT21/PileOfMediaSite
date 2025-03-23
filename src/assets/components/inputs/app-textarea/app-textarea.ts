import {applyStyleSheet, attach_delegates} from "../../defaults";
import {ApplyStyleSheet} from "../../apply-style-sheet";
import {StyleCSS} from "../../style-css";
import {
  AttributeValue,
  handleFieldset,
  setOrRemoveAttribute,
  setOrRemoveBooleanAttribute,
  templateString
} from "../common";
import html from "./app-textarea.html" with {type: "inline"};
import css from "./app-textarea.css" with {type: "inline"};
import {mapSelectors} from "../../../dom";
import {
  dataLabelAttr,
  disabledAttr,
  maxLengthAttr,
  minlengthAttr,
  placeholderAttr,
  requiredAttr,
  rowsAttr
} from "./attributes";
import {setMaxLength, setMinLength, setValueMissing} from "./validation";
import {Observer} from "../../../observer";
import {ValueSetEvent} from "../app-input/value-set-event";

type attributeKey = keyof typeof AppTextArea["observedAttributesMap"];
export type AppTextAreaElements = {
  textarea: HTMLTextAreaElement,
  label: HTMLLabelElement,
};
export const appTextAreaTexts = {
  required: "Required",
  textareaMinValidation: templateString<`${string}{min}${string}{currentLength}${string}`>
  ("Textarea only allows a maximum of {min} characters. Current length: {currentLength}"),
  textareaMaxValidation: templateString<`${string}{max}${string}{currentLength}${string}`>
  ("Textarea requires at least {max} characters. Current length: {currentLength}")
};

export class AppTextArea extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  static readonly formAssociated = true;
  errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  readonly elements: AppTextAreaElements;
  protected static readonly elementSelectors: { [key in keyof AppTextArea["elements"]]: string } = {
    textarea: "textarea",
    label: "label"
  }
  readonly texts = new Observer(appTextAreaTexts);
  private readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  private static readonly observedAttributesMap = {
    "data-label": dataLabelAttr,
    "required": requiredAttr,
    "disabled": (element: AppTextArea, value: AttributeValue): void => disabledAttr(element, value, element.internals, element.hasDisabledFieldset),
    "maxlength": maxLengthAttr,
    "minlength": minlengthAttr,
    "placeholder": placeholderAttr,
    "rows": rowsAttr
  }
  static readonly observedAttributes = <[attributeKey]>Object.keys(AppTextArea.observedAttributesMap);

  async attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppTextArea.observedAttributesMap[name as attributeKey]!;
    callback(this, newValue);
    await this.validate();
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

  get rows(): number | null
  {
    const attribute = this.getAttribute("rows");
    return attribute ? Number(attribute) : null;
  }

  set rows(value: number | null)
  {
    setOrRemoveAttribute(this, "rows", value?.toString());
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

  async connectedCallback(): Promise<void>
  {
    this.label = this.label || "";
    const {label} = this.elements;
    label.innerText = this.label;
    const {textarea} = this.elements;
    textarea.addEventListener("change", (e) => this.onTextAreaChange(e));
    textarea.placeholder = this.placeholder ?? "";

    handleFieldset(this, (value: boolean) =>
    {
      this.hasDisabledFieldset = value;
      disabledAttr(this, this.getAttribute("disabled"), this.internals, this.hasDisabledFieldset)
    });

    await this.setupValidation();
  }

  get value(): any
  {
    return this.elements.textarea.value;
  }

  set value(value: string | null | undefined)
  {
    if (value == null)
      value = "";

    this.elements.textarea.value = value;
    this.dispatchEvent(new ValueSetEvent({detail: value}));
  }

  private hasDisabledFieldset: boolean = false;


  get placeholder(): string | null | undefined
  {
    return this.getAttribute("placeholder")
  }

  set placeholder(value: string | null | undefined)
  {
    setOrRemoveAttribute(this, "placeholder", value);
  }

  async onTextAreaChange(_event: Event): Promise<void>
  {
    this.interacted = true;
    await this.validateAndReport();
  }

  constructor()
  {
    super();

    this.internals = this.attachInternals();
    this.internals.role = "textarea";
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
    this.elements = mapSelectors<AppTextAreaElements>(this.shadowRoot, AppTextArea.elementSelectors);
  }

  attach = attach_delegates;
  applyStyleSheet = applyStyleSheet;

  async setupValidation(): Promise<void>
  {
    const {textarea} = this.elements;
    textarea.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  async validate(): Promise<void>
  {
    const {textarea} = this.elements;
    await this.setValidity(textarea);
    this.internals.setValidity({});
    textarea.setCustomValidity("");
    const error = this.errors.entries().next().value;
    if (error)
    {
      this.internals.setValidity({[error[0]]: true}, error[1](), textarea);
      textarea.setCustomValidity(error[1]());
    }
    this.setCustomError = (): void =>
    {
    };
    if (!this.interacted)
      return;

    const invalid = !textarea.checkValidity();
    setOrRemoveBooleanAttribute(this, "data-invalid", invalid);
    setOrRemoveBooleanAttribute(textarea, "data-invalid", invalid);
  }

  private interacted: boolean = false;

  setCustomError(_input: HTMLTextAreaElement): void
  {
  }

  async validateAndReport(): Promise<void>
  {
    await this.validate();
    const {textarea} = this.elements;
    const error = this.errors.entries().next().value;

    if (error)
      textarea.setCustomValidity(error[1]());
    this.internals.reportValidity();
  }

  async setValidity(input: HTMLTextAreaElement): Promise<void>
  {
    this.internals.setFormValue(input.value);
    this.errors = new Map();
    setMinLength(this, input);
    setMaxLength(this, input);
    setValueMissing(this, input);
    this.setCustomError(input);
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
    if (customElements.get("app-textarea"))
      return;
    customElements.define("app-textarea", AppTextArea);
  }
}

AppTextArea.define();
