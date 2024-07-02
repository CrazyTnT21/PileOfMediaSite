export class AppInput extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ["required", "minlength", "maxlength"];

  attributeChangedCallback(name, oldValue, newValue) {
    this.validateInternals()
  }

  #internals;

  get label() {
    return this.getAttribute("data-label");
  }

  set label(value) {
    if (!value) {
      logNoValueError("data-label", this.outerHTML);
      value = "";
    }
    this.setAttribute("data-label", value);
    this.shadowRoot.querySelector("label").innerHTML = value;
  }

  get value() {
    return this.shadowRoot.querySelector("input").value;
  }

  set value(value) {
    this.#internals.setFormValue(value);
    this.shadowRoot.querySelector("input").value = value;
  }

  get placeholder() {
    return this.getAttribute("data-placeholder");
  }

  set placeholder(value) {
    this.setAttribute("data-placeholder", value);
    this.shadowRoot.querySelector("input").placeholder = value;
  }

  connectedCallback() {
  }

  disconnectedCallback() {
  }

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#internals.ariaRole = "textbox";
    this.attach();
    this.render();
    this.setupValidateInternals();
  }

  attach() {
    this.attachShadow({
      mode: "open",
      delegatesFocus: true
    });
  }
  setupValidateInternals() {
    const input = this.shadowRoot.querySelector("input");
    input.addEventListener("change", () => this.validateInternals());
    this.validateInternals();
  }

  validateInternals() {
    const input = this.shadowRoot.querySelector("input");
    this.reportValidity(input);
  }

  reportValidity(input) {
    this.setValidity(input);
    this.#internals.reportValidity();
  }

  setValidity(input) {
    this.#internals.setFormValue(input.value);
    if (
      !this.setValueMissing(input) &&
      !this.setMinLength(input) &&
      !this.setMaxLength(input)) {
      this.#internals.setValidity({})
    }
  }

  setValueMissing(input) {
    if (this.getAttribute("required") === "") {
      if (input.value === "") { //TODO: Translation
        this.#internals.setValidity({ valueMissing: true }, "No value given", input)
        return true;
      }
    }
    return false;
  }

  setMinLength(input) {
    const min = this.getAttribute("minlength");
    if (min) {
      if (!input.value || input.value.length < min) {
        this.#internals.setValidity({ tooShort: true }, `Input requires at least ${min} characters`)
        return true;
      }
    }
    return false;
  }

  setMaxLength(input) {
    const max = this.getAttribute("maxlength");
    if (max) {
      if (input.value && input.value.length > max) {
        this.#internals.setValidity({ tooLong: true }, `Input allows a maximum of ${max} characters`)
        return true;
      }
    }
    return false;
  }
  render() {
    const label = this.label ?? "";
    if (!label)
      logNoValueError("label", this.outerHTML);

    const placeholder = this.placeholder;

    //language=HTML
    this.shadowRoot.innerHTML = `
      <style>
        ${this.styleCSS()}
      </style>
      <div>
        <label for="input">${label}</label>
      </div>
      <input id="input" ${placeholder ? `placeholder="${placeholder}"` : ""}/>
    `;
  }

  styleCSS() {
    //language=CSS
    return `
      input {
        border-width: 1px;
        border-style: solid;
        border-color: var(--border);
        background-color: var(--input_background);
        color: var(--primary_text);
        padding: 5px;
        font-family: "Fira Sans", sans-serif;
        margin: 2px;
      }

      input:hover {
        border-color: var(--hover);
        transition: border-color ease 50ms;
      }
    `;
  }
}

export function logNoValueError(property, outerHtml) {
  console.error(`No value was given for '${property}' in '${outerHtml}'.`);
}

customElements.define("app-input", AppInput);
