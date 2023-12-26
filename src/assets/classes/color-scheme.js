export class ColorScheme
{
  name;

  primaryText;
  secondaryText;
  invertedPrimaryText;
  invertedSecondaryText;
  background;
  primaryBackground;
  secondaryBackground;
  inputBackground;
  border;
  hover;
  clickable;

  static dark()
  {
    const colorScheme = new ColorScheme();
    colorScheme.name = "dark";
    colorScheme.background = "#282828";
    colorScheme.primaryBackground = "#323232";
    colorScheme.secondaryBackground = "#3c3c3c";
    colorScheme.inputBackground = "#3f3f3f";
    colorScheme.border = "#a6a6a6";
    colorScheme.primaryText = "#e3e3e3";
    colorScheme.hover = "#464646";
    colorScheme.clickable = "#505050";
    return colorScheme;
  }

  static Keys = new Map([
    ["primaryText", "primary-text"],
    ["secondaryText", "secondary-text"],
    ["invertedPrimaryText", "inverted-primary-text"],
    ["invertedSecondaryText", "inverted-secondary-text"],
    ["background", "background"],
    ["primaryBackground", "primary-background"],
    ["secondaryBackground", "secondary-background"],
    ["inputBackground", "input-background"],
    ["border", "border"],
    ["hover", "hover"],
    ["clickable", "clickable"],
  ]);
}

export function loadColorScheme()
{
  const scheme = localStorage.getItem("color-scheme");

  if (!scheme || scheme === "{}")
  {
    return;
  }
  setColorScheme(JSON.parse(scheme));
}

export function removeColorScheme()
{
  for (const [, value] of ColorScheme.Keys)
  {
    document.documentElement.style.setProperty("--" + value, null);
  }
  localStorage.removeItem("color-scheme");
}

function setColorScheme(scheme)
{
  for (const [key, value] of ColorScheme.Keys)
  {
    document.documentElement.style.setProperty("--" + value, scheme[key] ? scheme[key] : null);
  }
}

export function saveColorScheme(value)
{
  localStorage.setItem("color-scheme", JSON.stringify(value));
}


