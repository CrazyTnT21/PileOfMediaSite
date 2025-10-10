import {AppImageInput} from "../app-image-input";
import {IncludesString, templateString} from "../../inputs/common";
import {unsafeObjectKeys} from "../../../unsafe-object-keys";

const texts = {
  removeImage: "Clear image",
  inputMinValidation: templateString<IncludesString<["{min}", "{fileSizes}"]>>
  ("Input requires files to be at least {min} kB. Current sizes: [{fileSizes}]"),
  inputMaxValidation: templateString<IncludesString<["{max}", "{fileSizes}"]>>
  ("Input requires files to be at most {max} kB. Current sizes: [{fileSizes}]"),
  pleaseFillOutThisInput: "Please fill out this input",
  unsupportedImageType: "Unsupported image type",
  required: "Required",
  uploadImages: "Upload images",
  filename: "Filename"
};
export const imageInputTexts = Object.freeze(texts);

export function setupTexts(self: AppImageInput): void
{
  const {label, images, removeImage, filename} = self["elements"];
  const textsUpdate: TextsKeysObject = {
    removeImage: (value) => removeImage.innerText = value,
    inputMinValidation: null,
    inputMaxValidation: null,
    pleaseFillOutThisInput: null,
    unsupportedImageType: null,
    required: (value) => label.setAttribute("data-text-required", value),
    uploadImages: (value) => images.title = value,
    filename: (value) =>
    {
      if (self["innerFiles"].length == 0)
        filename.innerText = value;
    }
  }
  for (const key of unsafeObjectKeys(textsUpdate))
  {
    const fn = textsUpdate[key];
    if (fn == null)
      continue;

    self.texts.addListener(key, (value) => fn(value));
  }
}

type TextsKeysObject = { [key in keyof typeof texts]: null | ((value: string) => void) };
