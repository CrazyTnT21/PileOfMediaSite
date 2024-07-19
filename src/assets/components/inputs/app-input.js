export class AppInput extends HTMLElement
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
      logNoValueError("data-label", this.outerHTML);
      value = "";
    }
    this.setAttribute("data-label", value);
    this.shadowRoot.querySelector("label").innerHTML = value;
  }

  get value()
  {
    return this.shadowRoot.querySelector("input").value;
  }

  set value(value)
  {
    if (value === undefined)
      value = null;

    this.shadowRoot.querySelector("input").value = value;
    this.dispatchEvent(new CustomEvent("valueSet", {detail: value}));
  }

  get placeholder()
  {
    return this.getAttribute("data-placeholder");
  }

  set placeholder(value)
  {
    this.setAttribute("data-placeholder", value);
    this.shadowRoot.querySelector("input").placeholder = value;
  }

  async connectedCallback()
  {
    const label = this.label ?? "";
    if (!label)
      logNoValueError("label", this.outerHTML);

    this.shadowRoot.querySelector("label").innerText = label;

    const input = this.shadowRoot.querySelector("input");

    if (this.placeholder)
      input.placeholder = this.placeholder;

    this.shadowRoot
        .querySelector("input")
        .addEventListener("change", (e) => this.onInputChange(e));
    await this.setupValidation();
  }

  disconnectedCallback()
  {
  }

  async onValueSet(event)
  {
    await this.validate();
  }

  async onInputChange(event)
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

  setupInternals()
  {
    this.#internals = this.attachInternals();
    this.#internals.ariaRole = "textbox";
  }

  applyStyleSheet()
  {
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(this.styleCSS());
    this.shadowRoot.adoptedStyleSheets = [styleSheet];
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
    const input = this.shadowRoot.querySelector("input");
    input.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  async validate()
  {
    const input = this.shadowRoot.querySelector("input");
    await this.setValidity(input);
    this.#internals.setValidity({}, input);
    input.setCustomValidity("");
    const error = this.errors.entries().next().value;
    if (error)
      this.#internals.setValidity({[error[0]]: true}, error[1](), input);
  }

  async validateAndReport()
  {
    await this.validate();
    const input = this.shadowRoot.querySelector("input");
    const error = this.errors.entries().next().value;
    if (error)
      input.setCustomValidity(error[1]());
    this.#internals.reportValidity();
  }

  async setValidity(input)
  {
    this.#internals.setFormValue(input.value);
    this.errors = new Map();
    this.setValueMissing(input);
    this.setMinLength(input);
    this.setMaxLength(input);
  }

  async valid()
  {
    const input = this.shadowRoot.querySelector("input");
    await this.setValidity(input);
    return this.errors.size === 0;
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

  render()
  {
    //language=HTML
    this.shadowRoot.innerHTML = `
        <label for="input"></label>
        <input id="input"/>
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
        input {
            min-width: 0;
            display: flex;
            flex: 1 1 100%;
            border-width: 1px;
            border-style: solid;
            border-color: var(--border);
            background-color: var(--input_background);
            color: var(--primary_text);
            padding: 5px;
            font-family: "Fira Sans", sans-serif;
        }

        input:hover {
            border-color: var(--hover);
            transition: border-color ease 50ms;
        }

        :host {
            flex-direction: column;
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

export function logNoValueError(property, outerHtml)
{
  console.error(`No value was given for '${property}' in '${outerHtml}'.`);
}

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

customElements.define("app-input", AppInput);
