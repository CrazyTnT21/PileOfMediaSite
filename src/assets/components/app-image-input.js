import { logNoValueError } from "./inputs/app-input.js";

export class AppImageInput extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ["required", "minlength", "maxlength"];

  attributeChangedCallback(name, oldValue, newValue) {
    this.validateInternals()
  }

  #internals;

  get alt() {
    return this.getAttribute("data-alt");
  }

  set alt(value) {
    if (!value) {
      logNoValueError("alt", this.outerHTML);
      value = "";
    }
    this.setAttribute("data-alt", value);
    this.shadowRoot.querySelector("img").alt = value;
  }

  get title() {
    return this.getAttribute("data-title");
  }

  set title(value) {
    this.setAttribute("data-title", value);
    this.shadowRoot.querySelector("img").title = value;
  }

  #src;
  get src() {
    return this.#src;
  }

  set src(value) {
    if (!value) {
      logNoValueError("src", this.outerHTML);
      value = this.#defaultSrc;
    }
    else {
      this.#src = value;
    }
    this.shadowRoot.querySelector("img").src = value;
  }

  connectedCallback() {
    const input = this.shadowRoot.querySelector("input");
    input.addEventListener("change", event => this.setImage(event));
    this.shadowRoot.querySelector("img").addEventListener("click", () => input.click());
  }

  disconnectedCallback() { }

  #defaultSrc = "/assets/img/Image_Input_Placeholder.svg";

  constructor() {
    super();
    this.#internals = this.attachInternals();
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
    this.validateInternals();
  }

  validateInternals() {
    const input = this.shadowRoot.querySelector("img");
    this.reportValidity(input);
  }

  reportValidity(input) {
    this.setValidity(input);
    this.#internals.reportValidity();
  }

  setValidity(input) {
    this.#internals.setFormValue(input.value);
    //TODO: Image too big
    // Image too small
    // File size too big

    if (!this.setValueMissing(input)) {
      this.#internals.setValidity({})
    }
  }

  setValueMissing(input) {
    if (this.getAttribute("required") === "") {
      if (!this.#src) { //TODO: Translation
        this.#internals.setValidity({ valueMissing: true }, "No value given", input)
        return true;
      }
    }
    return false;
  }

  render() {
    const alt = this.alt ?? "";
    const title = this.title;
    if (!alt)
      console.error(`image-input '${this.outerHTML}' has no alt. Images should always have an alt.`);

    //language=HTML
    this.shadowRoot.innerHTML = `
      <style>${this.styleCSS()}</style>
      <img tabindex=0 src="${this.#defaultSrc}" alt="${alt}" ${title ? `title="${title}"` : ""}>
      <input id="input" type="file" hidden="hidden" accept=".jpg,.jpeg,.png"/>
    `;
  }

  styleCSS() {
    //language=CSS
    return `
      img {
        aspect-ratio: 1 / 1.41421;
        width: 100%;
        object-fit: contain;
      }

      img:hover {
        filter: opacity(50%);
      }
    `;
  }

  setImage(event) {
    const url = URL.createObjectURL(event.target.files[0]);
    this.#src = url;
    this.shadowRoot.querySelector("img").src = url;
    this.shadowRoot.dispatchEvent(new CustomEvent("upload", { composed: true, detail: url }));
    this.validateInternals();
  }
}

customElements.define("app-image-input", AppImageInput);

