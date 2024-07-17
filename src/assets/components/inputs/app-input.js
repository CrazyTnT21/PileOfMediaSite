export class AppInput extends HTMLElement
{
  static formAssociated = true;
  static observedAttributes = ["required", "minlength", "maxlength"];
  errors = new Map();

  async attributeChangedCallback(name, oldValue, newValue)
  {
    await this.validate(false);
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
    this.addEventListener("valueSet", (e) => this.onValueSet(e));
    await this.setupValidation();
  }

  disconnectedCallback()
  {
  }

  async onValueSet(event)
  {
    await this.validate(false);
  }

  async onInputChange(event)
  {
    await this.validate(true);
  }

  constructor()
  {
    super();
    this.setupInternals();
    this.attach();
    this.render();
    this.applyStyleSheet();
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
    input.addEventListener("change", () => this.validate(true));
    await this.validate(false);
  }

  async validate(report)
  {
    const input = this.shadowRoot.querySelector("input");
    await this.setValidity(input);
    this.#internals.setValidity({}, input);
    for (const [x, y] of this.errors)
    {
      this.#internals.setValidity({[x]: true}, y(), input);
    }
    if (report)
      this.#internals.reportValidity();
  }

  async setValidity(input)
  {
    this.#internals.setFormValue(input.value);
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
      return;
    }
    this.errors.delete("valueMissing");
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
      return;
    }
    this.errors.delete("tooShort");
  }

  setMaxLength(input)
  {
    const max = this.getAttribute("maxlength");

    if (tooLong(input, max))
    {
      this.errors.set("tooLong", () => `Input only allows a maximum of ${max} characters`);
      return;
    }

    this.errors.delete("tooLong");
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

        :host([required]) > label::after {
            content: "*";
            color: red;
        }

        :host:invalid {
            background-color: red;
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
  return input.value === null || input.value.undefined || input.value === "";
}

function tooLong(input, max)
{
  if (!max)
    return false;
  return input.value && input.value.length > Number(max);
}

customElements.define("app-input", AppInput);
