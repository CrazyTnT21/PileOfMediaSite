import {applyStyleSheet, attach, attach_delegates} from "../defaults.js";
import {ApplyStyleSheet} from "../apply-style-sheet.js";
import {StyleCSS} from "../style-css.js";
import {logNoValueError} from "./validation/validation.js";

export class AppImageInput extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  static formAssociated = true;
  static observedAttributes = ["required", "minlength", "maxlength"];
  public errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  async attributeChangedCallback(name: string, oldValue: any, newValue: any)
  {
    await this.validate();
  }

  private internals: ElementInternals;

  get label(): string
  {
    return this.dataset["label"]!;
  }

  set label(value: string)
  {
    this.dataset["label"] = value;
    this.shadowRoot!.querySelector("label")!.innerText = value;
    this.shadowRoot!.querySelector("img")!.alt = value;
  }

  get maxFileSize(): number | null
  {
    const value = this.dataset["maxFilesize"];
    return value ? Number(value) : null;
  }

  set maxFileSize(value: number | null)
  {
    if (value == null)
      delete this.dataset["max-filesize"];
    else
      this.dataset["maxFilesize"] = value.toString();
  }

  get minFileSize(): number | null
  {
    const value = this.dataset["minFilesize"];
    return value ? Number(value) : null;
  }

  set minFileSize(value: number | null)
  {
    if (value == null)
      delete this.dataset["minFilesize"];
    else
      this.dataset["minFilesize"] = value.toString();
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
    this.shadowRoot!.querySelector("input")!.disabled = value;
  }

  get imageTitle(): string | null | undefined
  {
    return this.dataset["title"];
  }

  set imageTitle(value: string | null | undefined)
  {
    if (value == null)
      delete this.dataset["title"];
    else
      this.dataset["title"] = value;
    this.shadowRoot!.querySelector("img")!.title = value ?? "";
  }

  #src: string | undefined;
  get src(): string | undefined
  {
    return this.#src;
  }

  set src(value: string | undefined)
  {
    if (!value)
      throw Error("Src has to be set");
    this.#src = value;
    this.shadowRoot!.querySelector("img")!.src = value;
  }

  async connectedCallback()
  {
    const input = this.shadowRoot!.querySelector("input")!;
    input.addEventListener("change", event => this.setImage(<InputEvent>event));

    const image = this.shadowRoot!.querySelector("img")!;
    const label = this.dataset["label"] ?? "";
    if (!label)
      logNoValueError("label", this.outerHTML);

    image.alt = label;
    this.shadowRoot!.querySelector("label")!.innerText = label;
    if (this.imageTitle)
      image.title = this.imageTitle;

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

  private defaultSrc = "/assets/img/Image_Input_Placeholder.svg";

  constructor()
  {
    super();
    this.internals = this.attachInternals();
    this.attach();
    this.render();
    this.applyStyleSheet();
  }

  attach = attach_delegates;
  applyStyleSheet = applyStyleSheet;

  async setupValidation()
  {
    const input = this.shadowRoot!.querySelector("input")!;
    input.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  async validate()
  {
    const input = this.shadowRoot!.querySelector("input")!;
    await this.setValidity(input);
    this.internals.setValidity({});
    input.setCustomValidity("");
    const error = this.errors.entries().next().value;
    if (error)
    {
      const img = this.shadowRoot!.querySelector("img")!;
      this.internals.setValidity({[error[0]]: true}, error[1](), img);
    }
    this.setCustomError = () =>
    {
    };
  }

  setCustomError(input: HTMLInputElement)
  {
  }

  async validateAndReport()
  {
    await this.validate();
    const input = this.shadowRoot!.querySelector("input")!;
    const error = this.errors.entries().next().value;
    if (error)
      input.setCustomValidity(error[1]());
    this.internals.reportValidity();
  }

  async setValidity(input: HTMLInputElement)
  {
    this.internals.setFormValue(input.value);
    this.errors = new Map();
    this.setMaxFileSize(input);
    this.setMinFileSize(input);
    this.setValueMissing(input);
    this.setUnsupportedType(input);
    this.setCustomError(input);
  }

  setUnsupportedType(input: HTMLInputElement)
  {
    if (!unsupportedImageType(input))
      return;

    this.errors.set("customError", () => `Unsupported image type`);
  }

  setMaxFileSize(input: HTMLInputElement)
  {
    const max = this.maxFileSize;
    if (!fileTooBig(input, max))
      return;

    this.errors.set("customError", () => `Input only allows a maximum of ${max} characters. Current length: ${input.value.length}`);
  }

  setMinFileSize(input: HTMLInputElement)
  {
    const min = this.minFileSize;

    if (!fileTooSmall(input, min))
      return;

    this.errors.set("customError", () => `Input requires at least ${min} characters. Current length: ${input.value.length}`);
  }

  setValueMissing(input: HTMLInputElement)
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
    this.shadowRoot!.innerHTML = `
      <label for="input"></label>
      <input part="input" id="input" type="file" hidden="hidden" accept=".jpg,.jpeg,.png"/>
      <img alt="" part="img" tabindex=0 src="${this.defaultSrc}">
    `;
  }

  styleCSS()
  {
    //language=CSS
    return `
      img {
        border-radius: 5px;
        display: inline-flex;
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 1 / 1.41421;
        object-fit: contain;
        border: 1px solid lightgray;
      }

      label {
        padding: 2px;
      }

      input:invalid + img {
        border-color: red
      }

      img:hover {
        filter: opacity(50%);
      }

      :host {
        display: inline-flex;
        flex: 1 1 100%;
        flex-direction: column;
      }

      :host([disabled]) > img {
        filter: brightness(75%);
      }

      :host([required]) > label::after {
        content: "*";
        color: red;
      }
    `;
  }

  async valid()
  {
    const input = this.shadowRoot!.querySelector("input")!;
    await this.setValidity(input);
    return this.errors.size === 0;
  }

  async setImage(event: InputEvent)
  {
    const input = (<HTMLInputElement>event.target);
    const urls = [...input.files!].map(x => URL.createObjectURL(x));
    if (input.files!.length == 1)
    {
      if (!input!.files![0]!.type.includes("image"))
        this.shadowRoot!.querySelector("img")!.src = this.defaultSrc;
      else
        this.shadowRoot!.querySelector("img")!.src = urls[0]!;

      this.#src = urls[0];
    }
    if (await this.valid())
      this.shadowRoot!.dispatchEvent(new CustomEvent("upload", {composed: true, detail: urls}));
  }
}

customElements.define("app-image-input", AppImageInput);

function unsupportedImageType(input: HTMLInputElement)
{
  for (const file of input.files!)
  {
    if (!file.type.includes("image"))
      return true;
  }
  return false;
}

function fileTooBig(input: HTMLInputElement, max: number | undefined | null)
{
  if (!max)
    return false;

  for (const file of input.files!)
  {
    if (file.size > max * 1024)
      return true;
  }
  return false;
}

function fileTooSmall(input: HTMLInputElement, min: number | undefined | null)
{
  if (!min)
    return false;

  for (const file of input.files!)
  {
    if (file.size < min * 1024)
      return true;
  }
  return false;
}

function valueMissing(input: HTMLInputElement)
{
  return input.files!.length === 0;
}
