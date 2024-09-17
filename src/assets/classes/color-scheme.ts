export class ColorScheme
{
  name: string;
  style: ColorStyle;

  public constructor(name: string, style: ColorStyle)
  {
    this.name = name;
    this.style = style;
  }

  static dark()
  {
    const colorStyle = new ColorStyle();
    colorStyle.background = "#282828";
    colorStyle.primary_background = "#323232";
    colorStyle.secondary_background = "#3c3c3c";
    colorStyle.input_background = "#3f3f3f";
    colorStyle.border = "#a6a6a6";
    colorStyle.primary_text = "#e3e3e3";
    colorStyle.hover = "#464646";
    colorStyle.clickable = "#505050";
    colorStyle.feedback = "#3d3d3d";
    colorStyle.visited = "#c76fff"
    return new ColorScheme("dark", colorStyle);
  }
}

export class ColorStyle
{
  primary_text: string | undefined;
  secondary_text: string | undefined;
  inverted_primary_text: string | undefined;
  inverted_secondary_text: string | undefined;
  background: string | undefined;
  primary_background: string | undefined;
  secondary_background: string | undefined;
  input_background: string | undefined;
  border: string | undefined;
  hover: string | undefined;
  clickable: string | undefined;
  feedback: string | undefined;
  positive: string | undefined;
  positive_hover: string | undefined;
  negative: string | undefined;
  negative_hover: string | undefined;
  highlight: string | undefined;
  highlight_hover: string | undefined;
  visited: string | undefined;
}

export function removeColorScheme()
{
  for (const key of Object.keys(new ColorStyle()))
    document.documentElement.style.setProperty("--" + key.replace("_", "-"), null);

  localStorage.removeItem("color-scheme");
}

export function saveColorScheme(value: ColorScheme)
{
  const style: any = {};
  const keys = <(keyof ColorStyle)[]>Object.keys(value.style);

  for (const key of keys)
    style[key.replace("_", "-")] = value.style[key];

  const result = {name: value.name, style};
  localStorage.setItem("color-scheme", JSON.stringify(result));
}

export function loadColorScheme()
{
  const jsonScheme = localStorage.getItem("color-scheme");
  if (!jsonScheme || jsonScheme === "{}")
    return;

  const colorScheme = JSON.parse(jsonScheme);
  const colorStyle = colorScheme.style;
  const keys = Object.keys(new ColorStyle()).map(x => x.replace("_", "-"));
  for (const key of keys)
    document.documentElement.style.setProperty("--" + key, colorStyle[key] ? colorStyle[key] : null);
}
