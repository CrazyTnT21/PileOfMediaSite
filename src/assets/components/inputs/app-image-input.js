import {logNoValueError} from "./validation/validation.js";
import {applyStyleSheet, attach} from "../defaults.js";

export class AppImageInput extends HTMLElement
{
  static formAssociated = true;
  static observedAttributes = ["required", "minlength", "maxlength"];
  errors = new Map();

  async attributeChangedCallback(name, oldValue, newValue)
  {
    await this.validate();
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

  get maxFileSize()
  {
    const value = this.dataset.maxfilesize;
    return value ? Number(value) : null;
  }

  set maxFileSize(value)
  {
    this.dataset.maxfilesize = value;
  }

  get minFileSize()
  {
    const value = this.dataset.minfilesize;
    return value ? Number(value) : null;
  }

  set minFileSize(value)
  {
    this.dataset.minfilesize = value;
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

  async connectedCallback()
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
    await this.setupValidation();
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

  attach = attach;
  applyStyleSheet = applyStyleSheet;

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
    {
      const img = this.shadowRoot.querySelector("img");
      this.#internals.setValidity({[error[0]]: true}, error[1](), img);
    }
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
    this.setMaxFileSize(input);
    this.setMinFileSize(input);
    this.setValueMissing(input);
    this.setUnsupportedType(input);
  }

  setUnsupportedType(input)
  {
    if (!unsupportedImageType(input))
      return;

    this.errors.set("customError", () => `Unsupported image type`);
  }

  setMaxFileSize(input)
  {
    const max = this.maxFileSize;
    if (!fileTooBig(input, max))
      return;

    this.errors.set("customError", () => `Input only allows a maximum of ${max} characters`);
  }

  setMinFileSize(input)
  {
    const min = this.minFileSize;

    if (!fileTooSmall(input, min))
      return;

    this.errors.set("customError", () => `Input requires at least ${min} characters`);
  }

  setValueMissing(input)
  {
    if (!this.isRequired() || !valueMissing(input))
      return;

    this.errors.set("valueMissing", () => "No value given");
  }

  isRequired()
  {
    return this.getAttribute("required") === "";
  }

  render()
  {
    //TODO: Clear image button
    //language=HTML
    // noinspection HtmlRequiredAltAttribute
    this.shadowRoot.innerHTML = `
        <div part="required" title="Required"></div>
        <input part="input" id="input" type="file" hidden="hidden" accept=".jpg,.jpeg,.png"/>
        <img part="img" tabindex=0 src="${this.#defaultSrc}">
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
        img {
            aspect-ratio: 1 / 1.41421;
            width: 100%;
            object-fit: contain;
            border: 1px solid lightgray;
        }

        input:invalid + img {
            border-color: red
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

  async valid()
  {
    const input = this.shadowRoot.querySelector("input");
    await this.setValidity(input);
    return this.errors.size === 0;
  }

  async setImage(event)
  {
    const urls = [...event.target.files].map(x => URL.createObjectURL(x));
    if (event.target.files.length === 1)
    {
      if (!event.target.files[0].type.includes("image"))
        this.shadowRoot.querySelector("img").src = this.#defaultSrc;
      else
        this.shadowRoot.querySelector("img").src = urls[0];
      this.#src = urls[0];
    }
    if (await this.valid())
      this.shadowRoot.dispatchEvent(new CustomEvent("upload", {composed: true, detail: urls}));
  }
}

customElements.define("app-image-input", AppImageInput);

function unsupportedImageType(input)
{
  for (const file of input.files)
  {
    if (!file.type.includes("image"))
      return true;
  }
  return false;
}

function fileTooBig(input, max)
{
  if (!max)
    return false;

  for (const file of input.files)
  {
    if (file.size > max * 1024)
      return true;
  }
  return false;
}

function fileTooSmall(input, min)
{
  if (!min)
    return false;

  for (const file of input.files)
  {
    if (file.size < min * 1024)
      return true;
  }
  return false;
}

function valueMissing(input)
{
  return input.files.length === 0;
}