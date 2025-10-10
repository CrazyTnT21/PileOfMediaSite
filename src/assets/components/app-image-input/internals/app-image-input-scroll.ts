import {AppImageInput} from "../app-image-input";
import {Err, Ok, Result} from "../../../result/result";
import {indexArray} from "../../inputs/common";

export function currentScrollIndex(element: AppImageInput): number
{
  const {images} = element["elements"];
  const totalWidth = images.scrollWidth
  const currentPositionX = images.scrollLeft - images.clientWidth;
  const value = (currentPositionX / totalWidth * images.children.length) + 1;
  return Math.round(value);
}

export function scrollToCarouselImage(self: AppImageInput, index: number): void
{
  const {images, filename} = self["elements"];

  removeCurrentSelectedAttribute(self);
  setCurrentSelectedAttribute(self, index);

  indexArray(images.children, index).unwrap().scrollIntoView({block: "nearest", behavior: "smooth"});
  filename.innerText = indexArray(self["innerFiles"], index).unwrap().file.name;
}

export function scrollToPreviewImage(self: AppImageInput, index: number): void
{
  const {carousel, filename} = self["elements"];

  removeCurrentSelectedAttribute(self);
  setCurrentSelectedAttribute(self, index);
  indexArray(carousel.children, index).unwrap().scrollIntoView({block: "nearest", behavior: "smooth"});
  filename.innerText = indexArray(self["innerFiles"], index).unwrap().file.name;
}

export function removeCurrentSelectedAttribute(self: AppImageInput): void
{
  const {carousel} = self["elements"];
  const previousIndex = Number(carousel.getAttribute("data-selected-index")!);
  const previousCarouselChild = indexArray(carousel.children, previousIndex).unwrap();
  previousCarouselChild.removeAttribute("data-selected");
  carousel.setAttribute("data-selected-index", "0");
}

export function setCurrentSelectedAttribute(self: AppImageInput, index: number): void
{
  const {carousel} = self["elements"];
  const carouselChild = indexArray(carousel.children, index).unwrap();
  carouselChild.setAttribute("data-selected", "");
  carousel.setAttribute("data-selected-index", index.toString());
}

export function currentSelectedImageIndex(self: AppImageInput): Result<number, { noImages: true }>
{
  if (self["innerFiles"].length == 0)
    return new Err({noImages: true});
  const index = Number(self["elements"].carousel.getAttribute("data-selected-index"));
  return new Ok(index);
}
