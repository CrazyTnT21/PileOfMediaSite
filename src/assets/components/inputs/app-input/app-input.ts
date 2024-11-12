import {applyStyleSheet, attach_delegates} from "../../defaults.js";
import {logNoValueError, tooLong, tooShort, valueMissing} from "../validation/validation.js";
import {ApplyStyleSheet} from "../../apply-style-sheet.js";
import {StyleCSS} from "../../style-css.js";
import {handleFieldset} from "../common.js";
import {ValueSetEvent} from "./value-set-event.js";

type attributeKey = keyof typeof AppInput["observedAttributesMap"];

export class AppInput extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  static readonly formAssociated = true;
  errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  private readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  private static readonly observedAttributesMap = {
    "data-label": AppInput.dataLabelAttr,
    "required": AppInput.requiredAttr,
    "disabled": AppInput.disabledAttr,
    "maxlength": AppInput.maxLengthAttr,
    "minlength": AppInput.minlengthAttr,
    "placeholder": AppInput.placeholderAttr
  }
  static readonly observedAttributes = <[attributeKey]>Object.keys(AppInput.observedAttributesMap);

  async attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppInput.observedAttributesMap[name as attributeKey]!;
    callback(this, newValue);
    await this.validate();
  }

  //Attributes

  private static dataLabelAttr(element: AppInput, value: string | null | undefined): void
  {
    if (value == null || value.trim() == "")
    {
      logNoValueError("label", element.outerHTML);
      value = ""
    }
    element.shadowRoot.querySelector("label")!.innerText = value;
  }

  private static placeholderAttr(element: AppInput, value: string | null | undefined): void
  {
    element.shadowRoot.querySelector("input")!.placeholder = value ?? "";
  }

  private static disabledAttr(element: AppInput, value: string | null | undefined): void
  {
    const disabled = element.hasDisabledFieldset || value == "";
    const input = element.shadowRoot.querySelector("input")!;
    input.disabled = disabled;
    element.internals.ariaDisabled = disabled ? "" : null;
  }

  private static maxLengthAttr(element: AppInput, value: string | null | undefined): void
  {
    const input = element.shadowRoot.querySelector("input")!;
    if (value == null)
      input.removeAttribute("maxlength");
    else
      input.setAttribute("maxlength", value.toString());
  }

  private static minlengthAttr(element: AppInput, value: string | null | undefined): void
  {
    const input = element.shadowRoot.querySelector("input")!;
    if (value == null)
      input.removeAttribute("minlength");
    else
      input.setAttribute("minlength", value.toString());
  }

  private static requiredAttr(element: AppInput, value: string | null | undefined): void
  {
    element.shadowRoot.querySelector("input")!.required = value == "";
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

  get value(): any
  {
    return this.shadowRoot.querySelector("input")!.value;
  }

  set value(value: string | null | undefined)
  {
    if (value == null)
      value = "";

    this.shadowRoot.querySelector("input")!.value = value;
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
    AppInput.disabledAttr(this, this.getAttribute("disabled"))
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

  async connectedCallback(): Promise<void>
  {
    this.label = this.label || "";
    this.disabled = this.getAttribute("disabled") == "";
    const input = this.shadowRoot.querySelector("input")!;
    input.addEventListener("change", (e) => this.onInputChange(e));
    input.placeholder = this.placeholder ?? "";
    handleFieldset(this);
    await this.setupValidation();
  }

  async onValueSet(_event: Event): Promise<void>
  {
    await this.validate();
  }

  async onInputChange(_event: Event): Promise<void>
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
    const input = this.shadowRoot.querySelector("input")!;
    input.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  async validate(): Promise<void>
  {
    const input = this.shadowRoot.querySelector("input")!;
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
    if (this.interacted)
    {
      if (!input.checkValidity())
      {
        this.dataset["invalid"] = "";
        input.dataset["invalid"] = ""
      }
      else
      {
        delete this.dataset["invalid"];
        delete input.dataset["invalid"]
      }

    }
  }

  private interacted: boolean = false;

  async validateAndReport(): Promise<void>
  {
    await this.validate();
    const input = this.shadowRoot.querySelector("input")!;
    const error = this.errors.entries().next().value;
    if (error)
      input.setCustomValidity(error[1]());
    this.internals.reportValidity();
  }

  async setValidity(input: HTMLInputElement): Promise<void>
  {
    this.internals.setFormValue(input.value);
    this.errors = new Map();
    this.setValueMissing(input);
    this.setMinLength(input);
    this.setMaxLength(input);
    this.setCustomError(input);
  }

  async valid(): Promise<boolean>
  {
    const input = this.shadowRoot.querySelector("input")!;
    await this.setValidity(input);
    return this.errors.size == 0;
  }

  setValueMissing(input: HTMLInputElement): void
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

  setMinLength(input: HTMLInputElement): void
  {
    const min = this.getAttribute("minlength");

    if (tooShort(input, min ? Number(min) : null))
    {
      this.errors.set("tooShort", () => `Input requires at least ${min} characters. Current length: ${input.value.length}`);
    }
  }

  setMaxLength(input: HTMLInputElement): void
  {
    const max = this.getAttribute("maxlength");

    if (tooLong(input, max ? Number(max) : null))
    {
      this.errors.set("tooLong", () => `Input only allows a maximum of ${max} characters. Current length: ${input.value.length}`);
    }
  }

  setCustomError(_input: HTMLInputElement): void
  {
  }

  render(): void
  {
    //language=HTML
    this.shadowRoot.innerHTML = `
      <span class="parent container">
        <input class="input control" id="input"/>
        <label for="input"></label>
      </span>
    `;
  }

  styleCSS(): string
  {
    //language=CSS
    return `
      :host {
        --input-brightness-1--: var(--input-brightness-1, -20);
        --input-brightness-2--: var(--button-brightness-2, -40);
        --input-background-color--: var(--input-background-color, white);
        --input-background-color-disabled--: hsl(from var(--input-background-color--) h s calc(l + var(--input-brightness-1--)));

        --input-color--: var(--input-color, black);
        --input-color-disabled--: hsl(from var(--input-color--) h s calc(l + var(--input-brightness-1--)));

        --input-border-color--: var(--input-border-color, #969696);
        --input-border-color-hover--: hsl(from var(--input-border-color--) h s calc(l + var(--input-brightness-1--)));
        --input-border-color-disabled--:  hsl(from var(--input-border-color--) h s calc(l + var(--input-brightness-1--)));

        --input-label-color--: var(--input-label-color, #737373);

        --input-invalid-color--: var(--input-invalid-color, #dc0000);
        --input-invalid-color-hover--: hsl(from var(--input-invalid-color--) h s calc(l + var(--input-brightness-1--)));

        --input-outline-color--: var(--input-outline-color, Highlight);
      }

      * {
        font: 1rem "Fira Sans", sans-serif;
      }
      :host {
        padding: 5px;
        display: inline-flex;
        margin-top: 2px;
        flex: 1;
        box-sizing: border-box;
        max-width: 100%;
      }

      .input {
        background-color: var(--input-background-color--);
        display: inline-flex;
        border-radius: 5px;
        border-width: 1px;
        border-style: solid;
        border-color: var(--input-border-color--);
        flex: 1;
      }

      .input:focus {
        outline: var(--input-outline-color--) 2px solid;
      }

      .input:hover,
      .input:focus {
        background-color: var(--input-background-color--);
        color: var(--input-color--);
        border-color: var(--input-border-color-hover--);
        transition: border-color ease 50ms;
      }

      .input[data-invalid] {
        border-color: var(--input-invalid-color--);
      }

      .input[data-invalid]:hover,
      .input[data-invalid]:focus {
        border-color: var(--input-invalid-color-hover--);
      }

      label {
        position: absolute;
        color: var(--input-label-color--);
        transition: transform ease 50ms;
        margin: 6px;
        font-size: 1.10em;
        cursor: text;
      }

      .parent:has(input:focus) > label,
      .parent:has(input:not(input:placeholder-shown)) > label {
        cursor: default;
        color: var(--input-color--);
        font-size: 1em;
        margin: 0 0 0 5px;
        transform: translateY(calc(-60%));
        background: linear-gradient(180deg, transparent 0 7px, var(--input-background-color--) 7px 15px, transparent 15px 100%);

        transition: transform ease 50ms;
      }

      .parent:has(input:hover) > label,
      .parent:has(input:focus) > label {
        background: linear-gradient(180deg, transparent 0 7px, var(--input-background-color--) 7px 15px, transparent 15px 100%);
      }

      :host([required]) {
        label::after {
          content: "*";
          color: var(--input-invalid-color--);
        }
      }

      input:not(input:focus)::placeholder {
        color: transparent;
      }

      .container {
        display: inline-flex;
        flex: 1;
        box-sizing: border-box;
        max-width: 100%;
      }

      .control {
        background-color: var(--input-background-color--);
        color: var(--input-color--);
        display: inline-flex;
        padding: 5px;
        min-height: 0;
        min-width: 0;
        flex-wrap: wrap;
        border-radius: 5px;
        font-size: 1.10em;
      }

      :host([disabled]) {
        .input {
          background-color: var(--input-background-color-disabled--);
          color: var(--input-color-disabled--);
          border-color: var(--input-border-color-disabled--);
        }

        label:not([x]) {
          background: linear-gradient(180deg, transparent 0 7px, var(--input-background-color-disabled--) 7px 15px, transparent 15px 100%);
        }
      }
    `;
  }
}

customElements.define("app-input", AppInput);
