import type {ColorScheme, ColorStyle} from "../classes/color-scheme";

const jsonScheme = localStorage.getItem("color-scheme");

if (jsonScheme && jsonScheme != "{}")
{
  const colorScheme: ColorScheme = JSON.parse(jsonScheme);
  const colorStyle = colorScheme.style;
  const keys = <(keyof ColorStyle)[]>Object.keys(colorScheme.style);
  document.documentElement.dataset["colorScheme"] = colorScheme.name;
  for (const key of keys)
    document.documentElement.style.setProperty("--" + key, colorStyle[key] ? colorStyle[key]!.toString() : null);
}
