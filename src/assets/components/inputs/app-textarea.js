import {logNoValueError} from "./app-input.js";

export class AppTextArea extends HTMLElement
{
  static formAssociated = true;
  static observedAttributes = ["required", "minlength", "maxlength"];
  errors = new Map();

  async attributeChangedCallback(name, oldValue, newValue)
  {
    await this.validate();
  }

  #internals;

  get label()
  {
    return this.getAttribute("data-label");
  }

  set label(value)
  {
    if (!value)
    {
      logNoValueError("label", this.outerHTML);
      value = "";
    }
    this.setAttribute("data-label", value);
    this.shadowRoot.querySelector("label").innerHTML = value;
  }

  get value()
  {
    return this.shadowRoot.querySelector("textarea").value;
  }

  set value(value)
  {
    this.shadowRoot.querySelector("textarea").value = value;
  }

  async connectedCallback()
  {
    const label = this.label ?? "";
    if (!label)
      logNoValueError("label", this.outerHTML);

    this.shadowRoot.querySelector("label").innerText = label;

    await this.setupValidation();
  }

  disconnectedCallback()
  {
  }


  constructor()
  {
    super();
    this.#internals = this.attachInternals();
    this.#internals.ariaRole = "textarea";
    this.attach();
    this.render();
    this.applyStyleSheet();
  }

  attach()
  {
    this.attachShadow({
      mode: "open",
      delegatesFocus: true,
    });
  }


  async setupValidation()
  {
    const textarea = this.shadowRoot.querySelector("textarea");
    textarea.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  async validate()
  {
    const textarea = this.shadowRoot.querySelector("textarea");
    await this.setValidity(textarea);
    this.#internals.setValidity({}, textarea);
    textarea.setCustomValidity("");
    const error = this.errors.entries().next().value;
    if (error)
      this.#internals.setValidity({[error[0]]: true}, error[1](), textarea);
  }

  async validateAndReport()
  {
    await this.validate();
    const textarea = this.shadowRoot.querySelector("textarea");
    const error = this.errors.entries().next().value;

    if (error)
      textarea.setCustomValidity(error[1]());
    this.#internals.reportValidity();
  }

  async setValidity(input)
  {
    this.#internals.setFormValue(input.value);
    this.errors = new Map();
    this.setMinLength(input);
    this.setMaxLength(input);
    this.setValueMissing(input);
  }

  setMinLength(input)
  {
    const min = Number(this.getAttribute("minlength"));

    if (tooShort(input, min))
    {
      this.errors.set("tooShort", () => `Input requires at least ${min} characters`);
    }
  }

  setMaxLength(input)
  {
    const max = this.getAttribute("maxlength");

    if (tooLong(input, max))
    {
      this.errors.set("tooLong", () => `Input only allows a maximum of ${max} characters`);
    }
  }

  setValueMissing(input)
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
    this.shadowRoot.innerHTML = `
        <label for="input"></label>
        <textarea rows="5" id="input"></textarea>
    `;
  }

  applyStyleSheet()
  {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(this.styleCSS());
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
  }

  styleCSS()
  {
    //language=CSS
    return `
        textarea {
            display: flex;
            flex: 1 1 100%;

            border-width: 1px;
            border-style: solid;
            border-color: var(--border);

            background-color: var(--input_background);
            color: var(--primary_text);

            padding: 5px;
            font-family: "Fira Sans", sans-serif;

            min-width: 0;
            resize: none;
        }

        :host {
            flex-direction: column;
        }

        :host([required]) > label::after {
            content: "*";
            color: red;
        }

        textarea:hover {
            border-color: var(--hover);
            transition: border-color ease 50ms;
        }

        textarea:invalid {
            border-color: red;
        }
    `;
  }
}

customElements.define("app-textarea", AppTextArea);

function tooShort(input, min)
{
  if (!min)
    return false;
  return !input.value || input.value.length < Number(min);
}

function valueMissing(input)
{
  return input.value === null || input.value === undefined || input.value === "";
}

function tooLong(input, max)
{
  if (!max)
    return false;
  return input.value && input.value.length > Number(max);
}
