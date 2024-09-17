import {logNoValueError, tooLong, tooShort, valueMissing} from "./validation/validation.js";
import {applyStyleSheet, attach_delegates} from "../defaults.js";
import {ApplyStyleSheet} from "../apply-style-sheet.js";
import {StyleCSS} from "../style-css.js";
import {handleFieldset} from "./common.js";

export class AppTextArea extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  static formAssociated = true;
  static observedAttributes = ["required", "minlength", "maxlength"];
  errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  async attributeChangedCallback(name: string, oldValue: any, newValue: any)
  {
    await this.validate();
  }

  #internals;

  get label(): string
  {
    return this.dataset["label"]!;
  }

  set label(value: string)
  {
    this.dataset["label"] = value;
    this.shadowRoot!.querySelector("label")!.innerText = value;
  }

  get value(): string
  {
    return this.shadowRoot!.querySelector("textarea")!.value;
  }

  set value(value: string)
  {
    this.shadowRoot!.querySelector("textarea")!.value = value;
  }

  async connectedCallback()
  {
    let label = this.dataset["label"];
    if (!label)
    {
      logNoValueError("label", this.outerHTML);
      label = "";
    }
    this.shadowRoot!.querySelector("label")!.innerText = label;

    handleFieldset(this);

    await this.setupValidation();
  }

  constructor()
  {
    super();
    this.#internals = this.attachInternals();
    this.#internals.role = "textarea";
    this.attach();
    this.render();
    this.applyStyleSheet();
  }

  attach = attach_delegates;
  applyStyleSheet = applyStyleSheet;

  async setupValidation()
  {
    const textarea = this.shadowRoot!.querySelector("textarea")!;
    textarea.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  async validate()
  {
    const textarea = this.shadowRoot!.querySelector("textarea")!;
    await this.setValidity(textarea);
    this.#internals.setValidity({});
    textarea.setCustomValidity("");
    const error = this.errors.entries().next().value;
    if (error)
      this.#internals.setValidity({[error[0]]: true}, error[1](), textarea);
    this.setCustomError = () =>
    {
    };
  }

  setCustomError(input: HTMLTextAreaElement)
  {
  }

  async validateAndReport()
  {
    await this.validate();
    const textarea = this.shadowRoot!.querySelector("textarea")!;
    const error = this.errors.entries().next().value;

    if (error)
      textarea.setCustomValidity(error[1]());
    this.#internals.reportValidity();
  }

  async setValidity(input: HTMLTextAreaElement)
  {
    this.#internals.setFormValue(input.value);
    this.errors = new Map();
    this.setMinLength(input);
    this.setMaxLength(input);
    this.setValueMissing(input);
    this.setCustomError(input);
  }

  setMinLength(input: HTMLTextAreaElement)
  {
    const min = this.getAttribute("minlength");

    if (tooShort(input, min ? Number(min) : null))
    {
      this.errors.set("tooShort", () => `Input requires at least ${min} characters`);
    }
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
    this.shadowRoot!.querySelector("textarea")!.disabled = value;
  }

  setMaxLength(input: HTMLTextAreaElement)
  {
    const max = this.getAttribute("maxlength");

    if (tooLong(input, max ? Number(max) : null))
    {
      this.errors.set("tooLong", () => `Input only allows a maximum of ${max} characters. Current length: ${input.value.length}`);
    }
  }

  setValueMissing(input: HTMLTextAreaElement)
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

  render()
  {
    //language=HTML
    this.shadowRoot!.innerHTML = `
      <label part="label" for="input"></label>
      <textarea part="textarea" rows="5" id="input"></textarea>
    `;
  }

  styleCSS()
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

      label {
        padding: 2px;
      }

      :host {
        display: inline-flex;
        flex-direction: column;
        flex: 1 1 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      :host([required]) > label::after {
        content: "*";
        color: red;
      }

      textarea:hover {
        border-color: #E6E6E6FF;
        transition: border-color ease 50ms;
      }

      textarea:invalid {
        border-color: red;
      }
    `;
  }
}

customElements.define("app-textarea", AppTextArea);
