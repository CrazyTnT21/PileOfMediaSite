export class AppButton extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ["type"];

  #interals;

  attributeChangedCallback(name, value, oldValue) {
    if (name === "type")
      this.typeValue = value;
  }
  get type() {
    return this.getAttribute("type");
  }

  set type(value) {
    this.setAttribute("type", value);
    this.typeValue = value;
  }
  set typeValue(value) {
    this.shadowRoot.querySelector("button").type = value;
  }

  get value() {
    return this.getAttribute("data-value");
  }

  set value(value) {
    this.setAttribute("data-value", value);
    this.shadowRoot.querySelector("button").innerText = this.value;
  }
  connectedCallback() { }

  constructor() {
    super();
    this.#interals = this.attachInternals();
    this.#interals.ariaRole = "button";
    this.attachShadow({ mode: "open", delegatesFocus: true });
    this.render();
  }

  render() {
    const content = this.innerHTML;
    this.innerHTML = "";
    let type = this.type ? `type="${this.type}"` : "";

    //language=HTML
    this.shadowRoot.innerHTML = `
      <style>${this.styleCSS()}</style>
      <button ${type}>${this.value ?? content}</button>
    `;

    this.shadowRoot.querySelector("button").addEventListener("click", e => {
      if (e.target.type === "submit" && this.#interals.form) {
        if (this.#interals.form.reportValidity())
          this.#interals.form.submit()
      }
    })
  }

  styleCSS() {
    //language=CSS
    return `
        button {
            min-width: 4rem;
            min-height: 2rem;
            border: 0;
            background-color: var(--clickable);
            color: var(--primary_text);
        }

        button:hover {
            background-color: var(--hover);
        }

        button:active {
            background-color: var(--feedback);
        }
    `;
  }
}

customElements.define("app-button", AppButton);
