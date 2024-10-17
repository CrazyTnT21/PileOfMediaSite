import {logNoValueError, tooLong, tooShort, valueMissing} from "./validation/validation.js";
import {applyStyleSheet, attach_delegates} from "../defaults.js";
import {ApplyStyleSheet} from "../apply-style-sheet.js";
import {StyleCSS} from "../style-css.js";
import {handleFieldset} from "./common.js";
import {ValueSetEvent} from "./app-input/value-set-event";
import {AppInput} from "./app-input/app-input";

type attributeKey = keyof typeof AppInput["observedAttributesMap"];

export class AppTextArea extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  static readonly formAssociated = true;
  errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  private readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  private static readonly observedAttributesMap = {
    "data-label": AppTextArea.dataLabelAttr,
    "required": AppTextArea.requiredAttr,
    "disabled": AppTextArea.disabledAttr,
    "maxlength": AppTextArea.maxLengthAttr,
    "minlength": AppTextArea.minlengthAttr,
    "placeholder": AppTextArea.placeholderAttr,
    "rows": AppTextArea.rowsAttr
  }
  static readonly observedAttributes = <[attributeKey]>Object.keys(AppTextArea.observedAttributesMap);

  async attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    if (Object.keys(AppTextArea.observedAttributesMap).includes(name))
    {
      const callback = AppTextArea.observedAttributesMap[name as attributeKey]!;
      callback(this, newValue);
    }
    await this.validate();
  }

  //Attributes

  private static dataLabelAttr(element: AppTextArea, value: string | null | undefined): void
  {
    if (value == null || value.trim() == "")
    {
      logNoValueError("label", element.outerHTML);
      value = ""
    }
    element.shadowRoot.querySelector("label")!.innerText = value;
  }

  private static placeholderAttr(element: AppTextArea, value: string | null | undefined): void
  {
    element.shadowRoot.querySelector("textarea")!.placeholder = value ?? "";
  }

  private static disabledAttr(element: AppTextArea, value: string | null | undefined): void
  {
    const disabled = element.hasDisabledFieldset || value == "";
    const input = element.shadowRoot.querySelector("input")!;
    input.disabled = disabled;
    element.internals.ariaDisabled = disabled ? "" : null;
  }

  private static maxLengthAttr(element: AppTextArea, value: string | null | undefined): void
  {
    const input = element.shadowRoot.querySelector("textarea")!;
    if (value == null)
      input.removeAttribute("maxlength");
    else
      input.setAttribute("maxlength", value.toString());
  }

  private static rowsAttr(element: AppTextArea, value: string | null | undefined): void
  {
    const input = element.shadowRoot.querySelector("textarea")!;
    if (value == null)
      input.removeAttribute("rows");
    else
      input.setAttribute("rows", value.toString());
  }

  private static minlengthAttr(element: AppTextArea, value: string | null | undefined): void
  {
    const input = element.shadowRoot.querySelector("textarea")!;
    if (value == null)
      input.removeAttribute("minlength");
    else
      input.setAttribute("minlength", value.toString());
  }

  private static requiredAttr(element: AppTextArea, value: string | null | undefined): void
  {
    element.shadowRoot.querySelector("textarea")!.required = value == "";
  }

  get label(): string
  {
    return this.dataset["label"] ?? "";
  }

  set label(value: string)
  {
    this.dataset["label"] = value;
  }

  get required(): boolean
  {
    const attribute = this.getAttribute("required");
    return attribute ? attribute == "" : false;
  }

  set required(value: boolean)
  {
    if (value)
      this.setAttribute("required", "")
    else
      this.removeAttribute("required");
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

  get minLength(): number | null
  {
    const attribute = this.getAttribute("minlength");
    return attribute ? Number(attribute) : null;
  }

  set minLength(value: number | null)
  {
    if (value == null)
      this.removeAttribute("minlength")
    else
      this.setAttribute("minlength", value.toString());
  }

  get rows(): number | null
  {
    const attribute = this.getAttribute("rows");
    return attribute ? Number(attribute) : null;
  }

  set rows(value: number | null)
  {
    if (value == null)
      this.removeAttribute("rows")
    else
      this.setAttribute("rows", value.toString());
  }

  get maxLength(): number | null
  {
    const attribute = this.getAttribute("maxlength");
    return attribute ? Number(attribute) : null;
  }

  set maxLength(value: number | null)
  {
    if (value == null)
      this.removeAttribute("maxlength")
    else
      this.setAttribute("maxlength", value.toString())
  }

  async connectedCallback(): Promise<void>
  {
    this.label = this.label || "";
    this.shadowRoot.querySelector("label")!.innerText = this.label;
    const textarea = this.shadowRoot.querySelector("textarea")!;
    textarea.addEventListener("change", (e) => this.onTextAreaChange(e));
    textarea.placeholder = this.placeholder ?? "";

    handleFieldset(this);

    await this.setupValidation();
  }

  get value(): any
  {
    return this.shadowRoot.querySelector("textarea")!.value;
  }

  set value(value: string | null | undefined)
  {
    if (value == null)
      value = "";

    this.shadowRoot.querySelector("textarea")!.value = value;
    this.dispatchEvent(new ValueSetEvent({detail: value}));
  }

  private internalHasDisabledFieldset: boolean = false;

  get hasDisabledFieldset(): boolean
  {
    return this.internalHasDisabledFieldset;
  }

  set hasDisabledFieldset(value: boolean)
  {
    this.internalHasDisabledFieldset = value;
    AppTextArea.disabledAttr(this, this.getAttribute("disabled"))
  }

  get placeholder(): string | null | undefined
  {
    return this.getAttribute("placeholder")
  }

  set placeholder(value: string | null | undefined)
  {
    if (value == null)
      this.removeAttribute("placeholder");
    else
      this.setAttribute("placeholder", value);
  }

  async onTextAreaChange(event: Event): Promise<void>
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
  }

  attach = attach_delegates;
  applyStyleSheet = applyStyleSheet;

  async setupValidation(): Promise<void>
  {
    const textarea = this.shadowRoot.querySelector("textarea")!;
    textarea.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  async validate(): Promise<void>
  {
    const textarea = this.shadowRoot.querySelector("textarea")!;
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
    if (this.interacted)
    {
      if (!textarea.checkValidity())
      {
        this.dataset["invalid"] = "";
        textarea.dataset["invalid"] = ""
      }
      else
      {
        delete this.dataset["invalid"];
        delete textarea.dataset["invalid"]
      }
    }
  }

  private interacted: boolean = false;

  setCustomError(input: HTMLTextAreaElement): void
  {
  }

  async validateAndReport(): Promise<void>
  {
    await this.validate();
    const textarea = this.shadowRoot.querySelector("textarea")!;
    const error = this.errors.entries().next().value;

    if (error)
      textarea.setCustomValidity(error[1]());
    this.internals.reportValidity();
  }

  async setValidity(input: HTMLTextAreaElement): Promise<void>
  {
    this.internals.setFormValue(input.value);
    this.errors = new Map();
    this.setMinLength(input);
    this.setMaxLength(input);
    this.setValueMissing(input);
    this.setCustomError(input);
  }

  setMinLength(input: HTMLTextAreaElement): void
  {
    const min = this.getAttribute("minlength");

    if (tooShort(input, min ? Number(min) : null))
    {
      this.errors.set("tooShort", () => `Input requires at least ${min} characters`);
    }
  }

  setMaxLength(input: HTMLTextAreaElement): void
  {
    const max = this.getAttribute("maxlength");

    if (tooLong(input, max ? Number(max) : null))
    {
      this.errors.set("tooLong", () => `Input only allows a maximum of ${max} characters. Current length: ${input.value.length}`);
    }
  }

  setValueMissing(input: HTMLTextAreaElement): void
  {
    if (this.isRequired() && valueMissing(input))
    {
      this.errors.set("valueMissing", () => "No value given");
    }
  }

  isRequired(): boolean
  {
    return this.getAttribute("required") === "";
  }

  render(): void
  {
    //language=HTML
    this.shadowRoot.innerHTML = `
      <span class="parent container">
      <textarea part="textarea" rows="5" id="textarea"></textarea>
      <label part="label" for="textarea"></label>
        </span>
    `;
  }

  styleCSS(): string
  {
    //language=CSS
    return `
      textarea {
        border-radius: 5px;
        display: flex;
        flex: 1 1 100%;
        font-size: 1.10em;

        max-width: 100%;
        box-sizing: border-box;

        border-width: 1px;
        border-style: solid;
        border-color: lightgray;

        padding: 5px;
        font-family: "Fira Sans", sans-serif;

        min-width: 0;
        resize: none;
      }

      .textarea:hover {
        border-color: #E6E6E6FF;
        transition: border-color ease 50ms;
      }

      .textarea[data-invalid] {
        border-color: red;
      }

      label {
        position: absolute;
        /*TODO: Part*/
        color: var(--secondary-text, lightgray);
        transition: transform ease 50ms;
        margin: 6px;
        font-size: 1.10em;
      }

      .parent:has(textarea:focus) > label,
      .parent:has(textarea:not(textarea:placeholder-shown)) > label {
        /*TODO: Part*/
        color: var(--primary-text, black);
        font-size: 0.8em;
        line-height: 0.8em;
        margin: 0 0 0 5px;
        transform: translateY(calc(-60%));
        /*TODO: part*/
        background: linear-gradient(180deg, transparent 0 3px, var(--input-background) 3px 100%);

        transition: transform ease 50ms;
      }

      :host([required]) {
        label::after {
          content: "*";
          color: red;
        }

        textarea:not(textarea:focus) ~ label::after {
          /*TODO: Part*/
          color: var(--negative-hover, #ff9191);
        }
      }

      textarea:not(textarea:focus)::placeholder {
        color: transparent;
      }

      :host {
        padding: 5px;
        margin-top: 2px;
        display: inline-flex;
        flex: 1;
        box-sizing: border-box;
        max-width: 100%;
        align-self: flex-start;
      }

      .container {
        display: inline-flex;
        flex: 1;
        box-sizing: border-box;
        max-width: 100%;
      }

      * {
        font-family: "Fira Sans", sans-serif;
      }

      label {
        display: flex;
      }

      textarea[data-invalid] {
        border-color: red;
      }
    `;
  }
}

customElements.define("app-textarea", AppTextArea);
