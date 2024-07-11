import {logNoValueError} from "./inputs/app-input.js";

export class AppImageInput extends HTMLElement
{
  static formAssociated = true;
  static observedAttributes = ["required", "minlength", "maxlength"];

  attributeChangedCallback(name, oldValue, newValue)
  {
    this.validateInternals();
  }

  #internals;

  get alt()
  {
    return this.getAttribute("data-alt");
  }

  set alt(value)
  {
    if (!value)
    {
      console.error(`image-input '${this.outerHTML}' has no alt. Images should always have an alt.`);
      value = "";
    }
    this.setAttribute("data-alt", value);
    this.shadowRoot.querySelector("img").alt = value;
  }

  get disabled()
  {
    return this.getAttribute("disabled") === "";
  }

  set disabled(value)
  {
    if (value)
      this.setAttribute("disabled", "");
    else
      this.removeAttribute("disabled");
  }

  get title()
  {
    return this.getAttribute("data-title");
  }

  set title(value)
  {
    this.setAttribute("data-title", value);
    this.shadowRoot.querySelector("img").title = value;
  }

  #src;
  get src()
  {
    return this.#src;
  }

  set src(value)
  {
    if (!value)
    {
      logNoValueError("src", this.outerHTML);
      value = this.#defaultSrc;
    }
    else
    {
      this.#src = value;
    }
    this.shadowRoot.querySelector("img").src = value;
  }

  connectedCallback()
  {
    const input = this.shadowRoot.querySelector("input");
    input.addEventListener("change", event => this.setImage(event));
    let image = this.shadowRoot.querySelector("img");
    let alt = this.alt ?? "";
    if (!alt)
      console.error(`image-input '${this.outerHTML}' has no alt. Images should always have an alt.`);

    image.alt = alt;
    if (this.title)
      image.title = this.title;

    image.addEventListener("click", () =>
    {
      if (!this.disabled)
        input.click();
    });
    image.addEventListener("keyup", (e) =>
    {
      if (e.key === "Enter")
        input.click();
    });
    this.setupValidateInternals();
  }

  disconnectedCallback()
  {
  }

  #defaultSrc = "/assets/img/Image_Input_Placeholder.svg";

  constructor()
  {
    super();
    this.#internals = this.attachInternals();
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

  setupValidateInternals()
  {
    this.validateInternals();
  }

  validateInternals()
  {
    const input = this.shadowRoot.querySelector("img");
    this.reportValidity(input);
  }

  reportValidity(input)
  {
    this.setValidity(input);
    this.#internals.reportValidity();
  }

  setValidity(input)
  {
    this.#internals.setFormValue(input.value);
    //TODO:
    // Image too big
    // Image too small
    // File size too big

    if (!this.setValueMissing(input))
    {
      this.#internals.setValidity({});
    }
  }

  setValueMissing(input)
  {
    if (this.getAttribute("required") === "")
    {
      if (!this.#src)
      { //TODO: Translation
        this.#internals.setValidity({valueMissing: true}, "No value given", input);
        return true;
      }
    }
    return false;
  }

  render()
  {
    //language=HTML
    // noinspection HtmlRequiredAltAttribute
    this.shadowRoot.innerHTML = `
        <div title="Required"></div>
        <img tabindex=0 src="${this.#defaultSrc}">
        <input id="input" type="file" hidden="hidden" accept=".jpg,.jpeg,.png"/>
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
        img {
            aspect-ratio: 1 / 1.41421;
            width: 100%;
            object-fit: contain;
            border: 1px solid;
            border-color: var(--border);
        }

        img:hover {
            filter: opacity(50%);
        }

        :host([disabled]) > img {
            filter: brightness(75%);
        }

        div {
            position: absolute;
        }

        :host([required]) > div::before {
            content: "*";
            color: red;
        }
    `;
  }

  setImage(event)
  {
    const url = URL.createObjectURL(event.target.files[0]);
    this.#src = url;
    this.shadowRoot.querySelector("img").src = url;
    this.shadowRoot.dispatchEvent(new CustomEvent("upload", {composed: true, detail: url}));
    this.validateInternals();
  }
}

customElements.define("app-image-input", AppImageInput);

