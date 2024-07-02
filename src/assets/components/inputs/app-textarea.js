import { logNoValueError } from "./app-input.js";

export class AppTextArea extends HTMLElement {
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
      logNoValueError("label", this.outerHTML);
      value = "";
    }
    this.setAttribute("data-label", value);
    this.shadowRoot.querySelector("label").innerHTML = value;
  }

  get value() {
   return this.shadowRoot.querySelector("textarea").innerText;
  }

  set value(value) {
    this.shadowRoot.querySelector("textarea").innerText = value;
  }

  connectedCallback() {
  }

  disconnectedCallback() {
  }


  constructor() {
    super()

    this.#internals = this.attachInternals();
    this.#internals.ariaRole = "textarea";
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

  setValidity(textarea) {
    this.#internals.setFormValue(textarea.value);
    if (
      !this.setValueMissing(textarea) &&
      !this.setMinLength(textarea) &&
      !this.setMaxLength(textarea)) {
      this.#internals.setValidity({})
    }
  }


  setupValidateInternals() {
    const textarea = this.shadowRoot.querySelector("textarea");
    textarea.addEventListener("change", () => this.validateInternals());
    this.validateInternals();
  }

  validateInternals() {
    const textarea = this.shadowRoot.querySelector("textarea");
    this.reportValidity(textarea);
  }

  reportValidity(textarea) {
    this.setValidity(textarea);
    this.#internals.reportValidity();
  }

  setValueMissing(textarea) {
    if (this.getAttribute("required") === "") {
      if (textarea.value === "") { //TODO: Translation
        this.#internals.setValidity({ valueMissing: true }, "No value given", textarea)
        return true;
      }
    }
    return false;
  }
  setMinLength(textarea) {
    const min = this.getAttribute("minlength");
    if (min) {
      if (!textarea.value || textarea.value.length < min) {
        this.#internals.setValidity({ tooShort: true }, `Textarea requires at least ${min} characters`)
        return true;
      }
    }
    return false;
  }

  setMaxLength(textarea) {
    const max = this.getAttribute("maxlength");
    if (max) {
      if (textarea.value && textarea.value.length > max) {
        this.#internals.setValidity({ tooLong: true }, `Textarea allows a maximum of ${max} characters`)
        return true;
      }
    }
    return false;
  }
  render() {
    const label = this.label;
    if (!label)
      logNoValueError("label", this.outerHTML);

    //language=HTML
    this.shadowRoot.innerHTML = `
      <style>${this.styleCSS()}</style>
      <div>
        <label for="input">${label}</label>
      </div>
      <textarea id="input"></textarea>
    `;
  }

  styleCSS() {
    //language=CSS
    return `
      textarea {
        border-width: 1px;
        border-style: solid;
        border-color: var(--border);
        background-color: var(--input_background);
        color: var(--primary_text);
        padding: 5px;
        font-family: "Fira Sans", sans-serif;
      }

      textarea:hover {
        border-color: var(--hover);
        transition: border-color ease 50ms;
      }
    `;
  }
}

customElements.define("app-textarea", AppTextArea);
