import {applyStyleSheet, attachDelegates} from "../../defaults";
import {StyleCSS} from "../../style-css";
import {UploadEvent} from "./upload-event";
import html from "./app-image-input.html" with {type: "inline"};
import css from "./app-image-input.css" with {type: "inline"};
import {Kilobyte} from "../../../units/kilobyte";
import {AppButton} from "../../app-button/app-button";
import {mapSelectors} from "../../../dom";
import {
  labelAttribute,
  maxFilesizeAttribute,
  minFilesizeAttribute,
  multipleAttribute,
  imageTitleAttribute, disabledAttribute,
  requiredAttribute
} from "./attributes";
import {
  handleFieldset,
  IncludesString,
  setOrRemoveAttribute,
  setOrRemoveBooleanAttribute,
  templateString
} from "../common";
import {setMaxFileSize, setMinFileSize, setUnsupportedType, setValueMissing} from "./validation";
import {Observer} from "../../../observer";
import {mapBooleanAttribute, mapStringAttribute} from "../map-boolean-attribute";

type AttributeKey = keyof typeof AppImageInput["observedAttributesMap"];

export type AppImageInputElements = {
  input: HTMLInputElement,
  label: HTMLLabelElement,
  image: HTMLImageElement,
  clearImage: AppButton
};
export const appImageInputTexts = {
  clearImage: "Clear image",
  clearImages: "Clear images",
  inputMinValidation: templateString<IncludesString<["{min}", "{fileSizes}"]>>
  ("Input requires files to be at least {min} kB. Current sizes: [{fileSizes}]"),
  inputMaxValidation: templateString<IncludesString<["{max}", "{fileSizes}"]>>
  ("Input requires files to be at most {max} kB. Current sizes: [{fileSizes}]"),
  pleaseFillOutThisInput: "Please fill out this input",
  unsupportedImageType: "Unsupported image type",
  required: "Required",
};

export class AppImageInput extends HTMLElement implements StyleCSS
{
  public readonly texts = new Observer(appImageInputTexts);
  public readonly elements: AppImageInputElements;
  protected static readonly elementSelectors: { [key in keyof AppImageInput["elements"]]: string } = {
    input: "input",
    label: "label",
    image: "img",
    clearImage: "app-button"
  }

  public static readonly formAssociated = true;
  private readonly internals: ElementInternals;
  public override shadowRoot: ShadowRoot;

  protected errors: Map<keyof ValidityStateFlags, () => string> = new Map();

  protected static readonly observedAttributesMap = {
    "label": labelAttribute,
    "required": requiredAttribute,
    "disabled": disabledAttribute,
    "max-filesize": maxFilesizeAttribute,
    "min-filesize": minFilesizeAttribute,
    "image-title": imageTitleAttribute,
    "multiple": multipleAttribute
  }
  public static readonly observedAttributes = Object.keys(AppImageInput.observedAttributesMap);

  protected async attributeChangedCallback(name: AttributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppImageInput.observedAttributesMap[name];
    callback(this, newValue);
    await this.validate();
  }

  public get label(): string
  {
    return this.getAttribute("label") ?? "";
  }

  public set label(value: string)
  {
    this.setAttribute("label", value)
  }

  private innerFiles: { file: File, url: string }[] = [];

  public get files(): { file: File, url: string }[]
  {
    return this.innerFiles;
  }

  public set files(value)
  {
    this.innerFiles = value;
  }

  @mapBooleanAttribute("multiple")
  public accessor multiple: boolean = null!;

  private parentFieldSet: HTMLFieldSetElement | null | undefined;

  /**
   * If a parent fieldset is disabled, descendant form controls are also disabled.
   *
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/disabled#overview)
   */
  public get isDisabledByFieldSet(): boolean
  {
    return Boolean(this.parentFieldSet?.disabled);
  }

  public get disabled(): boolean
  {
    return this.getAttribute("disabled") == "" || this.isDisabledByFieldSet;
  }

  public set disabled(value: boolean)
  {
    setOrRemoveBooleanAttribute(this, "disabled", value);
  }

  public get maxFilesize(): Kilobyte | null
  {
    const attribute = this.getAttribute("max-filesize");
    return attribute ? Kilobyte.fromNumber(Number(attribute)) : null;
  }

  public set maxFilesize(value: Kilobyte | null)
  {
    setOrRemoveAttribute(this, "max-file-size", value?.toNumber().toString());
  }

  public get minFilesize(): Kilobyte | null
  {
    const attribute = this.getAttribute("min-filesize");
    return attribute ? Kilobyte.fromNumber(Number(attribute)) : null;
  }

  public set minFilesize(value: Kilobyte | null)
  {
    setOrRemoveAttribute(this, "min-filesize", value?.toNumber().toString());
  }

  @mapBooleanAttribute("required")
  public accessor required: boolean = null!;

  @mapStringAttribute("image-title")
  public accessor imageTitle: string | null | undefined;

  private internalSrc: string | undefined;

  public get src(): string | undefined
  {
    return this.internalSrc;
  }

  public set src(value: string | undefined)
  {
    if (!value)
      throw Error("Src has to be set");
    this.internalSrc = value;
    this.elements.image.src = value;
  }

  protected async connectedCallback(): Promise<void>
  {
    const {input, image, clearImage} = this.elements;
    input.addEventListener("change", (e) => this.onInputChange(e));
    this.label = this.label || "";

    image.alt = this.label;
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

    handleFieldset(this,
        (fieldSet) => this.parentFieldSet = fieldSet,
        () => disabledAttribute(this, this.getAttribute("disabled"))
    );

    await this.setupValidation();
  }

  private readonly defaultSrc: string;

  public constructor()
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

  protected async onInputChange(event: Event): Promise<void>
  {
    await this.setImage(<InputEvent>event)
    this.interacted = true;
    await this.validateAndReport();
  }

  protected async setupValidation(): Promise<void>
  {
    const {input} = this.elements;
    input.addEventListener("change", () => this.validateAndReport());
    await this.validate();
  }

  public async validate(): Promise<void>
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

  public setCustomError(_input: HTMLInputElement): void
  {
  }

  public async validateAndReport(): Promise<void>
  {
    await this.validate();
    const {input} = this.elements;
    const error = this.errors.entries().next().value;
    if (error)
      input.setCustomValidity(error[1]());
    this.internals.reportValidity();
  }

  protected async setValidity(input: HTMLInputElement): Promise<void>
  {
    this.internals.setFormValue(input.value);
    this.errors = new Map();
    setMaxFileSize(this);
    setMinFileSize(this);
    setValueMissing(this);
    setUnsupportedType(this);
    this.setCustomError(input);
  }

  protected render(): void
  {
    this.shadowRoot.innerHTML = html;
    applyStyleSheet(this.shadowRoot, this.styleCSS());
  }

  public styleCSS(): string
  {
    return css;
  }

  public async valid(): Promise<boolean>
  {
    const {input} = this.elements;
    await this.setValidity(input);
    return this.errors.size === 0;
  }

  protected async setImage(event: InputEvent): Promise<void>
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
