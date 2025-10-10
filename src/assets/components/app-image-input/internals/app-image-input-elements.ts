import {AppButton} from "../../app-button/app-button";

export const imageInputTag = "app-image-input" as const;

export const elementSelectors: { [key in keyof AppImageInputElements]: string } = Object.freeze({
  input: "input",
  label: "label",
  removeImage: "#remove-image",
  carousel: "#uploaded-images-carousel",
  previousImage: "#previous",
  nextImage: "#next",
  images: "#images",
  filename: "#file-name",
});

export type AppImageInputElements = {
  input: HTMLInputElement,
  label: HTMLLabelElement,
  removeImage: AppButton,
  carousel: HTMLDivElement,
  images: HTMLDivElement
  filename: HTMLSpanElement,
};
