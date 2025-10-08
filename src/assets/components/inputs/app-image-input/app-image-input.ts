import {applyStyleSheet, attachDelegates} from "../../defaults";
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
  IncludesString, randomNumber,
  setOrRemoveAttribute,
  setOrRemoveBooleanAttribute,
  templateString,
  setOrDeleteState
} from "../common";
import {setMaxFileSize, setMinFileSize, setUnsupportedType, setValueMissing} from "./validation";
import {Observer} from "../../../observer";
import {mapBooleanAttribute, mapStringAttribute} from "../map-boolean-attribute";
import {ErrorKey, ErrorResultCallback, setValidityMap} from "../../../validation";
import {Err} from "../../../result/result";

type AttributeKey = keyof typeof AppImageInput["observedAttributesMap"];
const imageInputTag = "app-image-input" as const;
export type ImageInputTag = typeof imageInputTag;

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

export class AppImageInput extends HTMLElement
{
  public readonly texts = new Observer(appImageInputTexts);
  private readonly elements: AppImageInputElements;
  protected static readonly elementSelectors: { [key in keyof AppImageInput["elements"]]: string } = {
    input: "input",
    label: "label",
    image: "img",
    clearImage: "app-button"
  }

  private interacted: boolean = false;

  public static readonly formAssociated = true;
  private readonly internals: ElementInternals;
  public override shadowRoot: ShadowRoot;

  protected errors: Map<number, ErrorResultCallback> = new Map();

  protected static readonly observedAttributesMap = {
    "label": labelAttribute,
    "required": requiredAttribute,
    "disabled": disabledAttribute,
    "max-filesize": maxFilesizeAttribute,
    "min-filesize": minFilesizeAttribute,
    "image-title": imageTitleAttribute,
    "multiple": multipleAttribute
  }

  /**
   * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  public static readonly observedAttributes = Object.keys(AppImageInput.observedAttributesMap);

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

  public get validity(): ValidityState
  {
    return this.internals.validity;
  }

  public get validationMessage(): string
  {
    return this.internals.validationMessage;
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

  /**
   * Called each time the element is added to the document.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)
   */
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

    this.setupValidation();
    this.updateValidity();
  }

  /**
   * Called when attributes are changed, added, removed, or replaced.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  protected async attributeChangedCallback(name: AttributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppImageInput.observedAttributesMap[name];
    callback(this, newValue);
    this.updateValidity();
  }

  protected async onInputChange(event: Event): Promise<void>
  {
    this.internals.setFormValue(this.elements.input.value);
    await this.setImage(<InputEvent>event)
    this.interacted = true;
    this.updateValidity();
    this.internals.reportValidity()
  }

  protected setupValidation(): void
  {
    const {input} = this.elements;
    this.errors = new Map();
    this.internals.setFormValue(input.value);
    this.addCustomError(() => setValueMissing(this));
    this.addCustomError(() => setMaxFileSize(this));
    this.addCustomError(() => setMinFileSize(this));
    this.addCustomError(() => setUnsupportedType(this));
  }

  public updateValidity(): void
  {
    const {input: fileInput} = this.elements;
    this.internals.setValidity({});

    fileInput.setCustomValidity("");

    if (!this.internals.willValidate)
    {
      this.internals.states.delete("interacted-invalid")
      return;
    }

    const validityMessages: Map<keyof ValidityStateFlags, string> = new Map();
    for (const [_, errorEntry] of this.errors)
    {
      const {error} = errorEntry();
      if (error)
      {
        validityMessages.set(error.state, error.userMessage);
      }
    }

    setValidityMap(fileInput, validityMessages);

    const validityStateFlags = Object.fromEntries([...validityMessages].map(([key, _]) => [key, true]))
    const validityMessage = [...validityMessages.values()].join("\n");
    this.internals.setValidity(validityStateFlags, validityMessage, fileInput);

    if (!this.interacted)
      return;

    const invalid = validityMessages.size > 0;
    setOrDeleteState(this.internals.states, "interacted-invalid", invalid);
  }

  protected render(): void
  {
    this.shadowRoot.innerHTML = html;
    applyStyleSheet(this.shadowRoot, this.styleCSS());
  }

  private styleCSS(): string
  {
    return css;
  }

  public addCustomError(callback: ErrorResultCallback): ErrorKey
  {
    const errorKey = randomNumber();
    this.errors.set(errorKey, callback);
    return errorKey
  }

  public removeCustomError(key: ErrorKey): void
  {
    this.errors.delete(key);
  }

  public setCustomValidity(validity: keyof ValidityStateFlags, message: string): void
  {
    const errorKey = this.addCustomError(() => new Err({state: validity, userMessage: message}));
    this.updateValidity();
    this.removeCustomError(errorKey);
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
    if (this.internals.checkValidity())
    {
      this.shadowRoot.dispatchEvent(new UploadEvent({composed: true, detail: files}));
      this.files = files;
    }
  }

  public static define(): void
  {
    if (customElements.get(imageInputTag))
      return;
    AppButton.define();
    customElements.define(imageInputTag, AppImageInput);
  }
}

AppImageInput.define();
