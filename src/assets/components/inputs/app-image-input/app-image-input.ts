import {applyStyleSheet, attach_delegates} from "../../defaults.js";
import {ApplyStyleSheet} from "../../apply-style-sheet.js";
import {StyleCSS} from "../../style-css.js";
import {logNoValueError} from "../validation/validation.js";
import {UploadEvent} from "./upload-event.js";

type attributeKey = keyof typeof AppImageInput["observedAttributesMap"];
type kiloByte = number;

export class AppImageInput extends HTMLElement implements ApplyStyleSheet, StyleCSS
{
  static readonly formAssociated = true;
  private readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  private static readonly observedAttributesMap = {
    "data-label": AppImageInput.dataLabelAttr,
    "required": AppImageInput.requiredAttr,
    "disabled": AppImageInput.disabledAttr,
    "data-max-filesize": AppImageInput.dataMaxFilesizeAttr,
    "data-min-filesize": AppImageInput.dataMinFilesizeAttr,
    "data-title": AppImageInput.dataTitleAttr,
    "data-multiple": AppImageInput.dataMultipleAttr
  }
  static readonly observedAttributes = <[attributeKey]>Object.keys(AppImageInput.observedAttributesMap);

  async attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppImageInput.observedAttributesMap[name as attributeKey]!;
    callback(this, newValue);
    await this.validate();
  }

  //Attributes

  private static dataLabelAttr(element: AppImageInput, value: string | null | undefined): void
  {
    if (value == null || value.trim() == "")
    {
      logNoValueError("label", element.outerHTML);
      value = ""
    }
    element.shadowRoot.querySelector("label")!.innerText = value;
    element.shadowRoot.querySelector("img")!.alt = value;
  }

  private static dataMultipleAttr(element: AppImageInput, value: string | null | undefined): void
  {
    element.shadowRoot.querySelector("input")!.multiple = value == "";
  }

  private static disabledAttr(element: AppImageInput, value: string | null | undefined): void
  {
    const disabled = element.hasDisabledFieldset || value == "";
    const input = element.shadowRoot.querySelector("input")!;
    input.disabled = disabled;
    element.internals.ariaDisabled = disabled ? "" : null;
  }

  private static dataMaxFilesizeAttr(_element: AppImageInput, _value: string | null | undefined): void
  {
  }

  private static dataMinFilesizeAttr(_element: AppImageInput, _value: string | null | undefined): void
  {
  }

  private static dataTitleAttr(element: AppImageInput, value: string | null | undefined): void
  {
    element.shadowRoot.querySelector("img")!.title = value ?? "";
  }

  private static requiredAttr(element: AppImageInput, value: string | null | undefined): void
  {
    element.shadowRoot.querySelector("input")!.required = value == "";
  }

  get label(): string
  {
    return this.dataset["label"] ?? "";
  }

  set label(value: string)
  {
    this.dataset["label"] = value;
  }

  private innerFiles: { file: File, url: string }[] = [];

  get files(): { file: File, url: string }[]
  {
    return this.innerFiles;
  }

  set files(value)
  {
    this.innerFiles = value;
  }

  get multiple(): boolean
  {
    const value = this.dataset["multiple"];
    return value == ""
  }

  set multiple(value: boolean)
  {
    if (!value)
      delete this.dataset["multiple"];
    else
      this.dataset["multiple"] = "";
  }

  private internalHasDisabledFieldset: boolean = false;

  get hasDisabledFieldset(): boolean
  {
    return this.internalHasDisabledFieldset;
  }

  set hasDisabledFieldset(value: boolean)
  {
    this.internalHasDisabledFieldset = value;
    AppImageInput.disabledAttr(this, this.getAttribute("disabled"))
  }

  get disabled(): boolean
  {
    return this.getAttribute("disabled") == "" || this.hasDisabledFieldset;
  }

  set disabled(value: boolean)
  {
    if (value)
      this.setAttribute("disabled", "")
    else
      this.removeAttribute("disabled");
  }

  get maxFilesize(): kiloByte | null
  {
    const attribute = this.dataset["maxFilesize"];
    return attribute ? Number(attribute) : null;
  }

  set maxFilesize(value: kiloByte | null)
  {
    if (value == null)
      delete this.dataset["maxFilesize"]
    else
      this.dataset["maxFilesize"] = value.toString()
  }

  get minFilesize(): kiloByte | null
  {
    const attribute = this.dataset["minFilesize"];
    return attribute ? Number(attribute) : null;
  }

  set minFilesize(value: kiloByte | null)
  {
    if (value == null)
      delete this.dataset["minFilesize"]
    else
      this.dataset["minFilesize"] = value.toString()
  }

  get required(): boolean
  {
    const attribute = this.getAttribute("required");
    return attribute ? attribute == "" : false;
  }

  set required(value: boolean)
  {
    if (value)
      this.setAttribute("required", "")
    else
      this.removeAttribute("required");
  }

  get imageTitle(): string
  {
    return this.dataset["title"] ?? "";
  }

  set imageTitle(value: string)
  {
    this.dataset["title"] = value;
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
    this.shadowRoot.querySelector("img")!.src = value;
  }

  async connectedCallback(): Promise<void>
  {
    const input = this.shadowRoot.querySelector("input")!;
    input.addEventListener("change", (e) => this.onInputChange(e));
    const image = this.shadowRoot.querySelector("img")!;
    this.label = this.label || "";

    image.alt = this.label;
    this.multiple = this.dataset["multiple"] == ""
    this.shadowRoot.querySelector("label")!.innerText = this.label;
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

  private readonly defaultSrc = "/assets/img/Image_Input_Placeholder.svg";

  constructor()
  {
    super();
    this.internals = this.attachInternals();
    this.shadowRoot = this.attach();
    this.render();
    this.applyStyleSheet();
  }

  attach = attach_delegates;
  applyStyleSheet = applyStyleSheet;

  async onInputChange(event: Event): Promise<void>
  {
    await this.setImage(<InputEvent>event)
    this.interacted = true;
    await this.validateAndReport();
  }

  async setupValidation(): Promise<void>
  {
    const input = this.shadowRoot.querySelector("input")!;
    input.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  async validate(): Promise<void>
  {
    const input = this.shadowRoot.querySelector("input")!;
    await this.setValidity(input);
    this.internals.setValidity({});
    input.setCustomValidity("");
    const error = this.errors.entries().next().value;
    if (error)
    {
      const img = this.shadowRoot.querySelector("img")!;
      this.internals.setValidity({[error[0]]: true}, error[1](), img);
      input.setCustomValidity(error[1]())
    }
    this.setCustomError = (): void =>
    {
    };
    if (this.interacted)
    {
      if (!input.checkValidity())
      {
        this.dataset["invalid"] = "";
        input.dataset["invalid"] = ""
      }
      else
      {
        delete this.dataset["invalid"];
        delete input.dataset["invalid"]
      }
    }
  }

  private interacted: boolean = false;

  setCustomError(_input: HTMLInputElement): void
  {
  }

  async validateAndReport(): Promise<void>
  {
    await this.validate();
    const input = this.shadowRoot.querySelector("input")!;
    const error = this.errors.entries().next().value;
    if (error)
      input.setCustomValidity(error[1]());
    this.internals.reportValidity();
  }

  async setValidity(input: HTMLInputElement): Promise<void>
  {
    this.internals.setFormValue(input.value);
    this.errors = new Map();
    this.setMaxFileSize(input);
    this.setMinFileSize(input);
    this.setValueMissing(input);
    this.setUnsupportedType(input);
    this.setCustomError(input);
  }

  setUnsupportedType(input: HTMLInputElement): void
  {
    if (!unsupportedImageType(input))
      return;

    this.errors.set("customError", () => `Unsupported image type`);
  }

  setMaxFileSize(input: HTMLInputElement): void
  {
    const max = this.maxFilesize;
    if (!fileTooBig(input, max))
      return;
    const fileSizes = [...input.files!].map(x => (x.size / 1000).toString() + " kB").join(", ");
    this.errors.set("customError", () => `Input requires files to be at most ${max} kB. Current sizes: [${fileSizes}]`);
  }

  setMinFileSize(input: HTMLInputElement): void
  {
    const min = this.minFilesize;

    if (!fileTooSmall(input, min))
      return;

    const fileSizes = [...input.files!].map(x => (x.size / 1000).toString() + " kB").join(", ");
    this.errors.set("customError", () => `Input requires files to be at least ${min} kB. Current sizes: [${fileSizes}]`);
  }

  setValueMissing(input: HTMLInputElement): void
  {
    if (!this.isRequired() || !valueMissing(input))
      return;

    this.errors.set("valueMissing", () => "No value given");
  }

  isRequired(): boolean
  {
    return this.getAttribute("required") === "";
  }

  render(): void
  {
    //TODO: Clear image button
    //language=HTML
    this.shadowRoot.innerHTML = `
      <label for="input"></label>
      <input part="input" id="input" type="file" hidden="hidden" accept=".jpg,.jpeg,.png"/>
      <img alt="" part="img" tabindex=0 src="${this.defaultSrc}">
    `;
  }

  styleCSS(): string
  {
    //language=CSS
    return `
      :host {
        --image-input-brightness-1--: var(--image-input-brightness-1, -20);
        --image-input-brightness-2--: var(--button-brightness-2, -40);
        --image-input-background-color--: var(--image-input-background-color, white);
        --image-input-background-color-hover--: hsl(from var(--image-input-background-color--) h s calc(l + var(--image-input-brightness-1--)));
        --image-input-background-color-disabled--: hsl(from var(--image-input-background-color--) h s calc(l + var(--image-input-brightness-2--)));

        --image-input-color--: var(--image-input-color, black);

        --image-input-border-color--: var(--image-input-border-color, #969696);
        --image-input-border-color-hover--: hsl(from var(--image-input-border-color--) h s calc(l + var(--image-input-brightness-1--)));
        --image-input-border-color-disabled--: hsl(from var(--image-input-border-color--) h s calc(l + var(--image-input-brightness-2--)));

        --image-input-invalid-color--: var(--image-input-invalid-color, #dc0000);
        --image-input-invalid-color-hover--: hsl(from var(--image-input-invalid-color--) h s calc(l + var(--image-input-brightness-1--)));
        --image-input-outline-color--: var(--image-input-outline-color, highlight)
      }

      img {
        border-radius: 5px;
        display: inline-flex;
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 1 / 1.41421;
        object-fit: contain;
        border: 1px solid var(--image-input-border-color--);
        flex: 1;
      }

      label {
        position: absolute;
        color: var(--image-input-color--);
        margin: 0 0 0 5px;
        transform: translateY(calc(-60%));
        background: linear-gradient(180deg, transparent 0 7px, var(--image-input-background-color--) 7px 15px, transparent 15px 100%);
        transition: transform ease 50ms;
      }

      :host {
        padding: 5px;
        margin-top: 2px;
        display: inline-flex;
        flex: 1;
        box-sizing: border-box;
        max-width: 100%;
      }

      :host([required]) {
        label::after {
          content: "*";
          color: var(--image-input-invalid-color--);
        }
      }

      input:not(input:focus)::placeholder {
        color: transparent;
      }

      img:hover, img:focus {
        border-color: var(--image-input-border-color-hover--);
      }

      input[data-invalid] + img {
        border-color: var(--image-input-invalid-color--)
      }

      input[data-invalid] + img:hover {
        border-color: var(--image-input-invalid-color-hover--);
      }

      img:focus {
        outline: var(--image-input-outline-color--) 2px solid;
      }

      :host([disabled]) > img {
        background-color: var(--image-input-background-color-disabled--)
      }

      :host([disabled]) {
        label {
          content: "*";
          background: linear-gradient(180deg, transparent 0 7px, var(--image-input-background-color-disabled--) 7px 15px, transparent 15px 100%);
        }
      }
    `;
  }

  async valid(): Promise<boolean>
  {
    const input = this.shadowRoot.querySelector("input")!;
    await this.setValidity(input);
    return this.errors.size === 0;
  }

  async setImage(event: InputEvent): Promise<void>
  {
    const input = (<HTMLInputElement>event.target);
    const files = [...input.files!].map(x => ({file: x, url: URL.createObjectURL(x)}));

    this.files = [];
    if (!this.multiple)
    {
      const file = files[files.length - 1]!;
      if (!file.file.type.includes("image"))
        this.shadowRoot.querySelector("img")!.src = this.defaultSrc;
      else
        this.shadowRoot.querySelector("img")!.src = file.url!;
      this.#src = file.url;
    }
    if (await this.valid())
    {
      this.shadowRoot.dispatchEvent(new UploadEvent({composed: true, detail: files}));
      this.files = files;
    }
  }
}

customElements.define("app-image-input", AppImageInput);

function unsupportedImageType(input: HTMLInputElement): boolean
{
  for (const file of input.files!)
  {
    if (!file.type.includes("image"))
      return true;
  }
  return false;
}

function fileTooBig(input: HTMLInputElement, max: kiloByte | undefined | null): boolean
{
  if (!max)
    return false;

  for (const file of input.files!)
  {
    if (file.size > max * 1000)
      return true;
  }
  return false;
}

function fileTooSmall(input: HTMLInputElement, min: kiloByte | undefined | null): boolean
{
  if (!min)
    return false;

  for (const file of input.files!)
  {
    if (file.size < min * 1000)
      return true;
  }
  return false;
}

function valueMissing(input: HTMLInputElement): boolean
{
  return input.files!.length === 0;
}
