import {applyStyleSheet, attachDelegates} from "../defaults";
import {UploadEvent} from "./upload-event";
import html from "./app-image-input.html" with {type: "inline"};
import css from "./app-image-input.css" with {type: "inline"};
import {Kilobyte} from "../../units/kilobyte";
import {AppButton} from "../app-button/app-button";
import {mapSelectors} from "../../dom";
import {
  disabledAttribute,
  imageTitleAttribute,
  labelAttribute,
  maxFilesizeAttribute,
  minFilesizeAttribute,
  multipleAttribute,
  requiredAttribute,
  AttributeKey
} from "./internals/app-image-input-attributes";
import {
  handleFieldset, indexArray,
  randomNumber,
  setOrDeleteState,
  setOrRemoveAttribute,
  setOrRemoveBooleanAttribute
} from "../inputs/common";
import {
  AppImageInputElements,
  elementSelectors,
  imageInputTag
} from "./internals/app-image-input-elements";
import {ErrorKey, ErrorResultCallback, setValidityMap} from "assets/validation";
import {Observer} from "../../observer";
import {unsafeObjectKeys} from "assets/unsafe-object-keys";
import {mapBooleanAttribute, mapStringAttribute} from "../inputs/map-boolean-attribute";
import {Err, Ok, Result} from "../../result/result";
import {
  currentScrollIndex,
  currentSelectedImageIndex,
  scrollToCarouselImage,
  scrollToPreviewImage
} from "./internals/app-image-input-scroll";
import {collectValidationMessages, setupValidation} from "./internals/app-image-input-validation";
import {imageInputTexts, setupTexts} from "./internals/app-image-input-texts";

export type ImageInputTag = typeof imageInputTag;

export class AppImageInput extends HTMLElement
{
  private readonly elements: AppImageInputElements;

  private innerFiles: { file: File, url: string }[] = [];

  private parentFieldSet: HTMLFieldSetElement | null | undefined;

  private interacted: boolean = false;

  private readonly internals: ElementInternals;

  private readonly errors: Map<number, ErrorResultCallback> = new Map();

  public static readonly formAssociated = true;

  public override shadowRoot: ShadowRoot;

  public readonly texts = new Observer(imageInputTexts);

  private static readonly observedAttributesMap = {
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
  public static readonly observedAttributes = unsafeObjectKeys(AppImageInput.observedAttributesMap);

  public get label(): string
  {
    return this.getAttribute("label") ?? "";
  }

  public set label(value: string)
  {
    this.setAttribute("label", value)
  }

  public get files(): { file: File, url: string }[]
  {
    return [...this.innerFiles];
  }

  @mapBooleanAttribute("multiple")
  public accessor multiple: boolean = null!;

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

  public constructor()
  {
    super();
    this.internals = this.attachInternals();
    this.shadowRoot = attachDelegates(this);
    this.render();
    this.elements = mapSelectors<AppImageInputElements>(this.shadowRoot, elementSelectors);
    setupTexts(this);
  }

  /**
   * Called each time the element is added to the document.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)
   */
  private async connectedCallback(): Promise<void>
  {
    const {input, removeImage, images} = this.elements;
    input.addEventListener("change", (e) => this.onInputChange(e));
    this.label = this.label || "";

    this.elements.label.innerText = this.label;

    images.addEventListener("click", () => input.click());
    images.addEventListener("keyup", (e) =>
    {
      if (e.key == "Enter")
        input.click();
    })
    images.addEventListener("scrollend", () =>
    {
      const previousIndex = Number(this.elements.carousel.getAttribute("data-selected-index")!);
      const index = currentScrollIndex(this);
      if (index == previousIndex)
        return;

      scrollToPreviewImage(this, index);
    });
    removeImage.addEventListener("click",
        () => currentSelectedImageIndex(this).map(x => this.removeImage(x)));

    handleFieldset(this,
        (fieldSet) => this.parentFieldSet = fieldSet,
        () => disabledAttribute(this, this.getAttribute("disabled"))
    );

    setupValidation(this);
    this.updateValidity();
  }

  /**
   * Called when attributes are changed, added, removed, or replaced.
   *
   * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
   */
  private async attributeChangedCallback(name: AttributeKey, _oldValue: string | null, newValue: string | null): Promise<void>
  {
    const callback = AppImageInput.observedAttributesMap[name];
    callback(this, newValue);
    this.updateValidity();
  }

  private onInputChange(event: Event): void
  {
    this.internals.setFormValue(this.elements.input.value);
    const input = (<HTMLInputElement>event.target);
    const files = [...input.files!].map(x => ({file: x, url: URL.createObjectURL(x)}));
    this.inputUploadImages(files);

    this.interacted = true;
    this.updateValidity();
    this.internals.reportValidity()
  }

  private render(): void
  {
    this.shadowRoot.innerHTML = html;
    applyStyleSheet(this.shadowRoot, this.styleCSS());
  }

  public clearFiles(): void
  {
    this.innerFiles = [];
    const {carousel, images, removeImage} = this.elements;
    carousel.innerHTML = "";
    images.innerHTML = "";
    removeImage.disabled = true;
    this.elements.filename.innerText = this.texts.get("filename");
    this.elements.input.value = "";
  }

  public removeImage<Index extends number>(index: Index): Result<void, { outOfBounds: Index, imageCount: number }>
  {
    const files = this.innerFiles;
    if (index < 0 || index >= files.length)
      return new Err({outOfBounds: index, imageCount: files.length});

    if (files.length == 1)
    {
      this.clearFiles();
      this.updateValidity();
      return new Ok(undefined);
    }
    const oldFiles = [...this.elements.input.files!];
    oldFiles.splice(index, 1);
    files.splice(index, 1);
    const list = new DataTransfer();
    for (const x of oldFiles)
    {
      list.items.add(x);
    }
    this.elements.input.files! = list.files;

    indexArray(this.elements.carousel.children, index).unwrap().remove();
    indexArray(this.elements.images.children, index).unwrap().remove();

    let newIndex = index.valueOf();
    if (newIndex == files.length)
      newIndex = files.length - 1;

    this.elements.filename.innerText = indexArray(this.innerFiles, newIndex).unwrap().file.name;
    this.elements.carousel.setAttribute("data-selected-index", newIndex.toString())
    indexArray(this.elements.carousel.children, newIndex).unwrap().setAttribute("data-selected", "");

    this.updateValidity();
    return new Ok(undefined);
  }

  private inputUploadImages(images: { file: File, url: string }[]): Result<void, ValidityState>
  {
    return this.uploadImages(images).map(() =>
    {
      scrollToPreviewImage(this, this.innerFiles.length - 1);
      scrollToCarouselImage(this, this.innerFiles.length - 1);
      this.dispatchEvent(new UploadEvent({composed: true, detail: images}));
    });
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

    const validityMessages = collectValidationMessages(this);
    setValidityMap(fileInput, validityMessages);

    const validityStateFlags = Object.fromEntries([...validityMessages].map(([key, _]) => [key, true]))
    const validityMessage = [...validityMessages.values()].join("\n");
    this.internals.setValidity(validityStateFlags, validityMessage, fileInput);

    if (!this.interacted)
      return;

    const invalid = validityMessages.size > 0;
    setOrDeleteState(this.internals.states, "interacted-invalid", invalid);
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

  private setImages(images: { file: File, url: string }[]): Result<void, ValidityState>
  {
    const previousLength = this.innerFiles.length;
    const {carousel, images: imagesElement, removeImage, filename, input} = this.elements;
    this.clearFiles();
    this.updateValidity();
    if (images.length == 0)
      return new Ok(undefined);

    removeImage.disabled = false;

    const list = new DataTransfer();
    for (const image of images)
    {
      const imgElement = document.createElement("img");
      imgElement.src = image.url;
      imagesElement.appendChild(imgElement);
      list.items.add(image.file);
    }

    input.files! = list.files;
    this.innerFiles = images;

    if (!this.internals.checkValidity)
    {
      this.clearFiles();
      return new Err(this.internals.validity);
    }

    for (const image of images)
    {
      const button = new AppButton();
      const img = document.createElement("img");
      button.addEventListener("click", () => scrollToCarouselImage(this, Array.prototype.indexOf.call(carousel.children, button)));

      img.src = image.url;

      button.appendChild(img);
      carousel.appendChild(button);
    }

    if (previousLength == 0)
    {
      indexArray(carousel.children, 0).unwrap().setAttribute("data-selected", "");
      filename.innerText = indexArray(images, 0).unwrap().file.name;
    }
    return new Ok(undefined)
  }

  public uploadImages(images: { file: File, url: string }[]): Result<void, ValidityState>
  {
    if (images.length == 0)
      return new Ok(undefined);

    if (this.multiple)
      return this.setImages([...this.innerFiles, ...images]);

    return this.setImages(images);
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
