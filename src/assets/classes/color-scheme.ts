export class ColorScheme
{
  name: string;
  style: ColorStyle;

  public constructor(name: string, style: ColorStyle)
  {
    this.name = name;
    this.style = style;
  }

  static dark(): ColorScheme
  {
    return new ColorScheme("dark", new ColorStyle());
  }

  static light(): ColorScheme
  {
    return new ColorScheme("light", new ColorStyle());
  }
}

export class ColorStyle
{
  app_background_1: string | undefined;
  app_background_2: string | undefined;
  app_background_3: string | undefined;
  app_background_4: string | undefined;

  app_color_1: string | undefined;
  app_color_2: string | undefined;

  app_text_1: string | undefined;
  app_text_2: string | undefined;
  app_text_3: string | undefined;

  app_input_background_color: string | undefined;
  app_button_background_color: string | undefined;

  app_outline: string | undefined;
  app_link: string | undefined;
  app_visited: string | undefined;
  app_negative: string | undefined;
  app_positive: string | undefined;
  app_negative_text: string | undefined;
  app_positive_text: string | undefined;
}

export function removeColorScheme(): void
{
  document.documentElement.removeAttribute("data-color-scheme");
  for (const key of Object.keys(new ColorStyle()))
    document.documentElement.style.setProperty("--" + key.replaceAll("_", "-"), null);

  localStorage.removeItem("color-scheme");
}

export function saveColorScheme(value: ColorScheme): void
{
  const style: any = {};
  const keys = <(keyof ColorStyle)[]>Object.keys(value.style);

  for (const key of keys)
    style[key.replaceAll("_", "-")] = value.style[key];

  const result = {name: value.name, style};
  localStorage.setItem("color-scheme", JSON.stringify(result));
}

export function loadColorScheme(): void
{
  const jsonScheme = localStorage.getItem("color-scheme");
  if (!jsonScheme || jsonScheme === "{}")
    return;

  const colorScheme: ColorScheme = JSON.parse(jsonScheme);
  const colorStyle = colorScheme.style;
  const keys = <(keyof ColorStyle)[]>Object.keys(new ColorStyle()).map(x => x.replaceAll("_", "-"));

  document.documentElement.setAttribute("data-color-scheme",colorScheme.name);
  for (const key of keys)
  {
    document.documentElement.style.setProperty("--" + key, colorStyle[key] ? colorStyle[key]!.toString() : null);
  }
}
