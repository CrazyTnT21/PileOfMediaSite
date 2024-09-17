import {applyStyleSheet, attach_delegates} from "../defaults.js";
import {logNoValueError, tooLong, tooShort, valueMissing} from "./validation/validation.js";
import {ApplyStyleSheet} from "../apply-style-sheet.js";
import {StyleCSS} from "../style-css.js";
import {handleFieldset} from "./common.js";

export class AppInput extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  static formAssociated = true;
  static observedAttributes = ["required", "minlength", "maxlength"];
  errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  async attributeChangedCallback(name: string, oldValue: any, newValue: any)
  {
    await this.validate();
  }

  private internals!: ElementInternals;

  get label(): string
  {
    return this.dataset["label"]!;
  }

  set label(value: string)
  {
    this.dataset["label"] = value;
    this.shadowRoot!.querySelector("label")!.innerHTML = value;
  }

  get value(): any
  {
    return this.shadowRoot!.querySelector("input")!.value;
  }

  set value(value: string | null | undefined)
  {
    if (value == null)
      value = "";

    this.shadowRoot!.querySelector("input")!.value = value;
    this.dispatchEvent(new CustomEvent("valueSet", {detail: value}));
  }

  disabledValue: boolean = false;
  hasDisabledFieldset: boolean = false;

  get disabled(): boolean
  {
    return this.getAttribute("disabled") == "";
  }

  set disabled(value: boolean)
  {
    this.disabledValue = value;
    value = this.disabledValue || this.hasDisabledFieldset;
    if (value)
      this.setAttribute("disabled", "");
    else
      this.removeAttribute("disabled");
    this.shadowRoot!.querySelector("input")!.disabled = value;
  }

  get placeholder(): string | null | undefined
  {
    return this.dataset["placeholder"]
  }

  set placeholder(value: string | null | undefined)
  {
    if (value == null)
    {
      delete this.dataset["placeholder"];
      this.shadowRoot!.querySelector("input")!.placeholder = "";
    }
    else
    {
      this.dataset["placeholder"] = value;
      this.shadowRoot!.querySelector("input")!.placeholder = value;
    }
  }

  async connectedCallback()
  {
    const label = this.dataset["label"] ?? "";
    if (!label)
      logNoValueError("label", this.outerHTML);
    this.label = label;
    this.placeholder = this.dataset["placeholder"];
    this.disabled = this.getAttribute("disabled") == "";

    this.shadowRoot!.querySelector("input")!.addEventListener("change", (e) => this.onInputChange(e));

    handleFieldset(this);
    await this.setupValidation();
  }

  async onValueSet(event: Event)
  {
    await this.validate();
  }

  async onInputChange(event: Event)
  {
    await this.validateAndReport();
  }

  constructor()
  {
    super();
    this.setupInternals();
    this.attach();
    this.render();
    this.applyStyleSheet();
    this.addEventListener("valueSet", (e) => this.onValueSet(e));
  }

  attach = attach_delegates;
  applyStyleSheet = applyStyleSheet;

  setupInternals()
  {
    this.internals = this.attachInternals();
    this.internals.role = "textbox";
  }

  async setupValidation()
  {
    const input = this.shadowRoot!.querySelector("input")!;
    input.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  async validate()
  {
    const input = this.shadowRoot!.querySelector("input")!;
    await this.setValidity(input);
    this.internals.setValidity({});
    input.setCustomValidity("");
    const error = this.errors.entries().next().value;
    if (error)
      this.internals.setValidity({[error[0]]: true}, error[1](), input);
    this.setCustomError = () =>
    {
    };
  }

  async validateAndReport()
  {
    await this.validate();
    const input = this.shadowRoot!.querySelector("input")!;
    const error = this.errors.entries().next().value;
    if (error)
      input.setCustomValidity(error[1]());
    this.internals.reportValidity();
  }

  async setValidity(input: HTMLInputElement)
  {
    this.internals.setFormValue(input.value);
    this.errors = new Map();
    this.setValueMissing(input);
    this.setMinLength(input);
    this.setMaxLength(input);
    this.setCustomError(input);
  }

  async valid()
  {
    const input = this.shadowRoot!.querySelector("input")!;
    await this.setValidity(input);
    return this.errors.size == 0;
  }

  setValueMissing(input: HTMLInputElement)
  {
    if (this.isRequired() && valueMissing(input))
    {
      this.errors.set("valueMissing", () => "No value given");
    }
  }

  isRequired()
  {
    return this.getAttribute("required") === "";
  }

  setMinLength(input: HTMLInputElement)
  {
    const min = this.getAttribute("minlength");

    if (tooShort(input, min ? Number(min) : null))
    {
      this.errors.set("tooShort", () => `Input requires at least ${min} characters. Current length: ${input.value.length}`);
    }
  }

  setMaxLength(input: HTMLInputElement)
  {
    const max = this.getAttribute("maxlength");

    if (tooLong(input, max ? Number(max) : null))
    {
      this.errors.set("tooLong", () => `Input only allows a maximum of ${max} characters. Current length: ${input.value.length}`);
    }
  }

  setCustomError(input: HTMLInputElement)
  {}

  render()
  {
    //language=HTML
    this.shadowRoot!.innerHTML = `
      <label part="label" for="input"></label>
      <input part="input" id="input"/>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
      input {
        border-radius: 5px;
        min-width: 0;
        font-size: 1.10em;
        display: inline-flex;
        flex: 1 1 100%;
        border-width: 1px;
        border-style: solid;
        border-color: lightgray;
        padding: 5px;
        font-family: "Fira Sans", sans-serif;
        max-width: 100%;
        box-sizing: border-box;
      }

      input:hover {
        border-color: #E6E6E6FF;
        transition: border-color ease 50ms;
      }

      :host {
        box-sizing: border-box;
        display: inline-flex;
        flex-direction: column;
        flex: 1 1 100%;
        max-width: 100%;
      }

      input:invalid {
        border-color: red;
      }

      :host([required]) > label::after {
        content: "*";
        color: red;
      }
    `;
  }
}

customElements.define("app-input", AppInput);
