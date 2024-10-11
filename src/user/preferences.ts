import {ColorScheme, loadColorScheme, removeColorScheme, saveColorScheme} from "../assets/classes/color-scheme.js";

const currentColorScheme = localStorage.getItem("color-scheme");

setColorSchemeChoice();

function setColorSchemeChoice(): void
{
  if (!currentColorScheme || currentColorScheme === "{}")
    return;

  const parsed = JSON.parse(currentColorScheme);
  const element: HTMLInputElement | null = document.querySelector(`[data-color=${parsed["name"]}]`);
  if (element == null)
  {
    console.warn(`Missing the element for the color scheme '${parsed["name"]}'!`);
    return;
  }
  element.checked = true;
}

document.querySelector("#default-color")!.addEventListener("click", () => removeColorScheme());

document.querySelector("#dark-color")!.addEventListener("click", () => saveAndLoadColorScheme(ColorScheme.dark()));

function saveAndLoadColorScheme(scheme: ColorScheme): void
{
  saveColorScheme(scheme);
  loadColorScheme();
}
