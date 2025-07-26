import {applyStyleSheet, attachDelegates} from "../../defaults";
import {StyleCSS} from "../../style-css";
import {UploadEvent} from "./upload-event";
import html from "./app-image-input.html" with {type: "inline"};
import css from "./app-image-input.css" with {type: "inline"};
import {Kilobyte} from "../../../units/kilobyte";
import {AppButton} from "../../app-button/app-button";
import {mapSelectors} from "../../../dom";
import {
  dataLabelAttr,
  dataMaxFilesizeAttr,
  dataMinFilesizeAttr,
  dataMultipleAttr,
  dataTitleAttr, disabledAttr,
  requiredAttr
} from "./attributes";
import {
  AttributeValue,
  handleFieldset,
  setOrRemoveAttribute,
  setOrRemoveBooleanAttribute,
  SurroundedString,
  templateString
} from "../common";
import {setMaxFileSize, setMinFileSize, setUnsupportedType, setValueMissing} from "./validation";
import {Observer} from "../../../observer";

type attributeKey = keyof typeof AppImageInput["observedAttributesMap"];

export type AppImageInputElements = {
  input: HTMLInputElement,
  label: HTMLLabelElement,
  image: HTMLImageElement,
  clearImage: AppButton
};
export const appImageInputTexts = {
  clearImage: "Clear image",
  clearImages: "Clear images",
  inputMinValidation: templateString<`${SurroundedString<"{min}">}{fileSizes}${string}`>
  ("Input requires files to be at least {min} kB. Current sizes: [{fileSizes}]"),
  inputMaxValidation: templateString<`${SurroundedString<"{max}">}{fileSizes}${string}`>
  ("Input requires files to be at most {max} kB. Current sizes: [{fileSizes}]"),
  valueMissing: "No value given",
  unsupportedImageType: "Unsupported image type",
  required: "Required",
};

export class AppImageInput extends HTMLElement implements StyleCSS
{
  readonly texts = new Observer(appImageInputTexts);
  readonly elements: AppImageInputElements;
  protected static readonly elementSelectors: { [key in keyof AppImageInput["elements"]]: string } = {
    input: "input",
    label: "label",
    image: "img",
    clearImage: "app-button"
  }

  static readonly formAssociated = true;
  private readonly internals: ElementInternals;
  override shadowRoot: ShadowRoot;

  errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  private static readonly observedAttributesMap = {
    "data-label": dataLabelAttr,
    "required": requiredAttr,
    "disabled": (element: AppImageInput, value: AttributeValue): void => disabledAttr(element, value, element.internals, element.hasDisabledFieldset),
    "data-max-filesize": dataMaxFilesizeAttr,
    "data-min-filesize": dataMinFilesizeAttr,
    "data-title": dataTitleAttr,
    "data-multiple": dataMultipleAttr
  }
  static readonly observedAttributes = Object.keys(AppImageInput.observedAttributesMap);

  async attributeChangedCallback(name: attributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppImageInput.observedAttributesMap[name];
    callback(this, newValue);
    await this.validate();
  }

  get label(): string
  {
    return this.getAttribute("data-label") ?? "";
  }

  set label(value: string)
  {
    this.setAttribute("data-label", value)
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
    const value = this.getAttribute("data-multiple");
    return value == "";
  }

  set multiple(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "data-multiple", value);
  }

  private hasDisabledFieldset: boolean = false;

  get disabled(): boolean
  {
    return this.getAttribute("disabled") == "" || this.hasDisabledFieldset;
  }

  set disabled(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "disabled", value);
  }

  get maxFilesize(): Kilobyte | null
  {
    const attribute = this.getAttribute("data-max-filesize");
    return attribute ? Kilobyte.fromNumber(Number(attribute)) : null;
  }

  set maxFilesize(value: Kilobyte | null)
  {
    setOrRemoveAttribute(this, "max-file-size", value?.toNumber().toString());
  }

  get minFilesize(): Kilobyte | null
  {
    const attribute = this.getAttribute("data-min-filesize");
    return attribute ? Kilobyte.fromNumber(Number(attribute)) : null;
  }

  set minFilesize(value: Kilobyte | null)
  {
    setOrRemoveAttribute(this, "data-min-filesize", value?.toNumber().toString());
  }

  get required(): boolean
  {
    const attribute = this.getAttribute("required");
    return attribute ? attribute == "" : false;
  }

  set required(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "required", value);
  }

  get imageTitle(): string | null
  {
    return this.getAttribute("data-title");
  }

  set imageTitle(value: string | null)
  {
    setOrRemoveAttribute(this, "data-title", value);
  }

  private internalSrc: string | undefined;

  get src(): string | undefined
  {
    return this.internalSrc;
  }

  set src(value: string | undefined)
  {
    if (!value)
      throw Error("Src has to be set");
    this.internalSrc = value;
    this.elements.image.src = value;
  }

  async connectedCallback(): Promise<void>
  {
    const {input, image, clearImage} = this.elements;
    input.addEventListener("change", (e) => this.onInputChange(e));
    this.label = this.label || "";

    image.alt = this.label;
    this.multiple = this.getAttribute("data-multiple") == ""
    this.elements.label.innerText = this.label;
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
    clearImage.addEventListener("click", () =>
    {
      this.files = [];
      image.src = this.defaultSrc;
    });

    handleFieldset(this, (value: boolean) =>
    {
      this.hasDisabledFieldset = value;
      disabledAttr(this, this.getAttribute("disabled"), this.internals, this.hasDisabledFieldset)
    });

    await this.setupValidation();
  }

  private readonly defaultSrc: string;

  constructor()
  {
    super();
    this.internals = this.attachInternals();
    this.shadowRoot = attachDelegates(this);
    this.render();
    this.elements = mapSelectors<AppImageInputElements>(this.shadowRoot, AppImageInput.elementSelectors);
    this.defaultSrc = this.elements.image.src;
    this.texts.addListener("clearImage", (value) =>
    {
      if (this.multiple)
        return;

      this.elements.clearImage.innerText = value;
    });
    this.texts.addListener("clearImages", (value) =>
    {
      if (!this.multiple)
        return;

      this.elements.clearImage.innerText = value;
    });

    this.texts.addListener("required", (value) =>
    {
      this.elements.label.setAttribute("data-text-required", value);
    });
  }

  async onInputChange(event: Event): Promise<void>
  {
    await this.setImage(<InputEvent>event)
    this.interacted = true;
    await this.validateAndReport();
  }

  async setupValidation(): Promise<void>
  {
    const {input} = this.elements;
    input.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  async validate(): Promise<void>
  {
    const {input, image} = this.elements;
    await this.setValidity(input);
    this.internals.setValidity({});
    input.setCustomValidity("");
    const error = this.errors.entries().next().value;
    if (error)
    {
      this.internals.setValidity({[error[0]]: true}, error[1](), image);
      input.setCustomValidity(error[1]())
    }
    this.setCustomError = (): void =>
    {
    };
    if (!this.interacted)
      return;

    const invalid = !input.checkValidity();
    setOrRemoveBooleanAttribute(this, "data-invalid", invalid);
    setOrRemoveBooleanAttribute(input, "data-invalid", invalid);
  }

  private interacted: boolean = false;

  setCustomError(_input: HTMLInputElement): void
  {
  }

  async validateAndReport(): Promise<void>
  {
    await this.validate();
    const {input} = this.elements;
    const error = this.errors.entries().next().value;
    if (error)
      input.setCustomValidity(error[1]());
    this.internals.reportValidity();
  }

  async setValidity(input: HTMLInputElement): Promise<void>
  {
    this.internals.setFormValue(input.value);
    this.errors = new Map();
    setMaxFileSize(this);
    setMinFileSize(this);
    setValueMissing(this);
    setUnsupportedType(this);
    this.setCustomError(input);
  }

  render(): void
  {
    this.shadowRoot.innerHTML = html;
    applyStyleSheet(this.shadowRoot, this.styleCSS());
  }

  styleCSS(): string
  {
    return css;
  }

  async valid(): Promise<boolean>
  {
    const {input} = this.elements;
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
      const {image} = this.elements;
      const file = files[files.length - 1]!;
      image.src = file.file.type.includes("image") ? file.url : this.defaultSrc
      this.internalSrc = file.url;
    }
    if (await this.valid())
    {
      this.shadowRoot.dispatchEvent(new UploadEvent({composed: true, detail: files}));
      this.files = files;
    }
  }

  public static define(): void
  {
    AppButton.define();
    if (customElements.get("app-image-input"))
      return;
    customElements.define("app-image-input", AppImageInput);
  }
}

AppImageInput.define();
