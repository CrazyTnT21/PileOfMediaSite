export class ColorScheme
{
  name;
  style;

  static dark()
  {
    const colorScheme = new ColorScheme();
    const colorStyle = new ColorStyle();
    colorScheme.style = colorStyle;

    colorScheme.name = "dark";
    colorStyle.background = "#282828";
    colorStyle.primary_background = "#323232";
    colorStyle.secondary_background = "#3c3c3c";
    colorStyle.input_background = "#3f3f3f";
    colorStyle.border = "#a6a6a6";
    colorStyle.primary_text = "#e3e3e3";
    colorStyle.hover = "#464646";
    colorStyle.clickable = "#505050";
    colorStyle.feedback = "#3d3d3d";
    return colorScheme;
  }
}

export class ColorStyle
{
  primary_text;
  secondary_text;
  inverted_primary_text;
  inverted_secondary_text;
  background;
  primary_background;
  secondary_background;
  input_background;
  border;
  hover;
  clickable;
  feedback;
}

export function removeColorScheme()
{
  for (const key of Object.keys(new ColorStyle()))
    document.documentElement.style.setProperty("--" + key, null);

  localStorage.removeItem("color-scheme");
}

export function saveColorScheme(value)
{
  localStorage.setItem("color-scheme", JSON.stringify(value));
}

export function loadColorScheme()
{
  const jsonScheme = localStorage.getItem("color-scheme");
  if (!jsonScheme || jsonScheme === "{}")
    return;

  const colorScheme = JSON.parse(jsonScheme);
  const colorStyle = colorScheme.style;
  const keys = Object.keys(new ColorStyle());
  for (const key of keys)
    document.documentElement.style.setProperty("--" + key, colorStyle[key] ? colorStyle[key] : null);
}
